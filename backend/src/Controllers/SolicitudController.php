<?php
namespace Controllers;

use Services\SolicitudService;
use Core\Factory\SolicitudFactory;
use Database\SolicitudRepository;
use Database\AsignacionRepository;
use Database\TicketRepository;
use Database\LocalidadRepository;

class SolicitudController extends BaseController {
    private $solicitudService;
    private $solicitudRepository;
    private $asignacionRepository;
    private $ticketRepository;
    private $localidadRepository;
    
    public function __construct() {
        $this->solicitudService = new SolicitudService();
        $this->solicitudRepository = new SolicitudRepository();
        $this->asignacionRepository = new AsignacionRepository();
        $this->ticketRepository = new TicketRepository();
        $this->localidadRepository = new LocalidadRepository();
    }
    
    // POST /api/solicitudes
    public function crear() {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['usuario_id', 'cantidad_litros', 'tipo_solicitud']);
            
            $solicitud = $this->solicitudService->crearSolicitud(
                $data['tipo_solicitud'],
                $data['usuario_id'],
                $data['cantidad_litros'],
                $data['descripcion'] ?? ''
            );
            
            $this->jsonResponse([
                'id' => $solicitud->getId(),
                'tipo' => $solicitud->getTipo(),
                'estado' => $solicitud->getEstado(),
                'cantidad_litros' => $solicitud->getCantidadLitros(),
                'fecha_limite' => $solicitud->getFechaLimite(),
                'prioridad' => $solicitud->getPrioridad()
            ], 201);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // GET /api/solicitudes
    public function listar() {
        try {
            $solicitudes = $this->solicitudRepository->obtenerTodas();
            $this->jsonResponse($solicitudes);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/solicitudes/{id}
    public function obtener($id) {
        try {
            $solicitud = $this->solicitudRepository->obtenerPorId($id);
            if (!$solicitud) {
                $this->jsonResponse('Solicitud no encontrada', 404);
                return;
            }
            
            $this->jsonResponse($solicitud);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/solicitudes/{id}/asignacion
    public function obtenerAsignacion($id) {
        try {
            if (!$this->solicitudRepository->existe($id)) {
                $this->jsonResponse('Solicitud no encontrada', 404);
                return;
            }
            
            $asignacion = $this->asignacionRepository->obtenerDetallesCompletos($id);
            
            if (!$asignacion) {
                $this->jsonResponse('Solicitud no encontrada', 404);
                return;
            }
            
            // Formatear respuesta
            $response = [
                'solicitud' => [
                    'id' => $asignacion['solicitud_id'],
                    'cantidad_litros' => $asignacion['cantidad_litros'],
                    'tipo_solicitud' => $asignacion['tipo_solicitud'],
                    'estado' => $asignacion['estado'],
                    'descripcion' => $asignacion['descripcion_solicitud'],
                    'fecha_solicitud' => $asignacion['fecha_solicitud']
                ]
            ];
            
            // Si está asignada, agregar detalles de asignación
            if (in_array($asignacion['estado'], ['asignada', 'en_proceso', 'completada'])) {
                $response['asignacion'] = [
                    'localidad' => [
                        'id' => $asignacion['localidad_id'],
                        'nombre' => $asignacion['localidad_nombre'],
                        'direccion' => $asignacion['localidad_direccion'],
                        'latitud' => $asignacion['latitud'],
                        'longitud' => $asignacion['longitud']
                    ],
                    'asesor' => [
                        'id' => $asignacion['asesor_id'],
                        'nombre' => $asignacion['asesor_nombre'],
                        'telefono' => $asignacion['asesor_telefono']
                    ],
                    'encargado' => [
                        'nombre' => $asignacion['encargado_nombre'],
                        'telefono' => $asignacion['encargado_telefono']
                    ],
                    'comentario_asesor' => $asignacion['comentario_asesor'],
                    'fecha_asignacion' => $asignacion['fecha_asignacion']
                ];
                
                // Agregar información del ticket si existe
                if ($asignacion['codigo_ticket']) {
                    $response['ticket'] = [
                        'codigo' => $asignacion['codigo_ticket'],
                        'estado' => $asignacion['ticket_estado'],
                        'fecha_llegada' => $asignacion['ticket_fecha_llegada'],
                        'cantidad_entregada' => $asignacion['ticket_cantidad_entregada'],
                        'observaciones' => $asignacion['ticket_observaciones']
                    ];
                }
            }
            
            $this->jsonResponse($response);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // PUT /api/solicitudes/{id}/asignar
    public function asignar($id) {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['localidad_id', 'asesor_id']);
            
            // Iniciar transacción para garantizar consistencia
            $db = \Config\Database::getInstance()->getConnection();
            $db->beginTransaction();
            
            try {
                // 1. Verificar que la solicitud existe y está pendiente
                if (!$this->solicitudRepository->estaPendiente($id)) {
                    throw new \Exception('Solicitud no encontrada o ya asignada');
                }
                
                $solicitud = $this->solicitudRepository->obtenerPorId($id);
                
                // 2. Obtener y verificar localidad
                $localidad = $this->localidadRepository->obtenerPorId($data['localidad_id']);
                if (!$localidad) {
                    throw new \Exception('Localidad no encontrada');
                }
                
                // 3. Verificar disponibilidad
                if ($localidad['disponibilidad'] < $solicitud['cantidad_litros']) {
                    throw new \Exception('Localidad sin suficiente disponibilidad');
                }
                
                // 4. Crear la asignación
                $observaciones = $data['observaciones'] ?? 'Asignación automática por asesor';
                $asignacion = $this->asignacionRepository->crear(
                    $id, 
                    $data['localidad_id'], 
                    $data['asesor_id'], 
                    $observaciones
                );
                
                if (!$asignacion) {
                    throw new \Exception('Error al crear asignación');
                }
                
                // 5. Actualizar estado de solicitud
                if (!$this->solicitudRepository->actualizarEstado($id, 'asignada')) {
                    throw new \Exception('Error al actualizar estado de solicitud');
                }
                
                // 6. Reducir disponibilidad de localidad
                if (!$this->localidadRepository->reducirDisponibilidad(
                    $data['localidad_id'], 
                    $solicitud['cantidad_litros']
                )) {
                    throw new \Exception('Error al actualizar disponibilidad de localidad');
                }
                
                // 7. Generar ticket automáticamente
                $ticket = $this->ticketRepository->crear($id);
                if (!$ticket) {
                    throw new \Exception('Error al generar ticket');
                }
                
                // Confirmar transacción
                $db->commit();
                
                // 8. Obtener información completa de la asignación
                $asignacionCompleta = $this->asignacionRepository->obtenerDetallesCompletos($id);
                
                $this->jsonResponse([
                    'mensaje' => 'Solicitud asignada correctamente y ticket generado',
                    'solicitud_id' => $id,
                    'ticket_codigo' => $ticket['codigo_ticket'],
                    'asignacion' => [
                        'solicitud_id' => $asignacionCompleta['solicitud_id'],
                        'cantidad_litros' => $asignacionCompleta['cantidad_litros'],
                        'localidad_nombre' => $asignacionCompleta['localidad_nombre'],
                        'localidad_direccion' => $asignacionCompleta['localidad_direccion'],
                        'asesor_nombre' => $asignacionCompleta['asesor_nombre'],
                        'comentario_asesor' => $asignacionCompleta['comentario_asesor'],
                        'codigo_ticket' => $asignacionCompleta['codigo_ticket'],
                        'ticket_estado' => $asignacionCompleta['ticket_estado']
                    ]
                ]);
                
            } catch (\Exception $e) {
                // Revertir transacción en caso de error
                $db->rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // PUT /api/solicitudes/{id}/estado
    public function cambiarEstado($id) {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['accion']);
            
            $solicitud = $this->solicitudRepository->obtenerPorId($id);
            if (!$solicitud) {
                $this->jsonResponse('Solicitud no encontrada', 404);
                return;
            }
            
            $estadoActual = $solicitud['estado'];
            $accion = $data['accion'];
            $nuevoEstado = '';
            
            // Validar transiciones de estado (State Pattern simplificado)
            switch ($estadoActual) {
                case 'pendiente':
                    if ($accion === 'asignar') {
                        $nuevoEstado = 'asignada';
                    } elseif ($accion === 'cancelar') {
                        $nuevoEstado = 'cancelada';
                    } else {
                        throw new \Exception("Acción '$accion' no válida para estado '$estadoActual'");
                    }
                    break;
                    
                case 'asignada':
                    if ($accion === 'procesar') {
                        $nuevoEstado = 'en_proceso';
                    } elseif ($accion === 'cancelar') {
                        $nuevoEstado = 'cancelada';
                    } else {
                        throw new \Exception("Acción '$accion' no válida para estado '$estadoActual'");
                    }
                    break;
                    
                case 'en_proceso':
                    if ($accion === 'completar') {
                        $nuevoEstado = 'completada';
                    } elseif ($accion === 'cancelar') {
                        $nuevoEstado = 'cancelada';
                    } else {
                        throw new \Exception("Acción '$accion' no válida para estado '$estadoActual'");
                    }
                    break;
                    
                case 'completada':
                case 'cancelada':
                    throw new \Exception("No se puede cambiar estado de una solicitud '$estadoActual'");
                    
                default:
                    throw new \Exception("Estado actual '$estadoActual' no reconocido");
            }
            
            // Actualizar estado usando repository
            if (!$this->solicitudRepository->actualizarEstado($id, $nuevoEstado)) {
                throw new \Exception('Error al actualizar estado en la base de datos');
            }
            
            $this->jsonResponse([
                'mensaje' => "Estado cambiado de '$estadoActual' a '$nuevoEstado'",
                'solicitud_id' => $id,
                'estado_anterior' => $estadoActual,
                'estado_nuevo' => $nuevoEstado
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
}
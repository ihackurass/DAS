<?php
namespace Controllers;

use Database\TicketRepository;
use Database\SolicitudRepository;
use Database\LocalidadRepository;

class TicketController extends BaseController {
    private $ticketRepository;
    private $solicitudRepository;
    private $localidadRepository;
    
    public function __construct() {
        $this->ticketRepository = new TicketRepository();
        $this->solicitudRepository = new SolicitudRepository();
        $this->localidadRepository = new LocalidadRepository();
    }
    
    // GET /api/tickets/{codigo} - Buscar ticket por código
    public function buscarPorCodigo($codigo) {
        try {
            $ticket = $this->ticketRepository->buscarPorCodigo($codigo);
            
            if (!$ticket) {
                $this->jsonResponse('Ticket no encontrado', 404);
                return;
            }
            
            // Formatear respuesta con información completa
            $response = [
                'ticket' => [
                    'id' => $ticket['id'],
                    'codigo' => $ticket['codigo_ticket'],
                    'estado' => $ticket['estado_entrega'],
                    'fecha_llegada' => $ticket['fecha_llegada'],
                    'cantidad_entregada' => $ticket['cantidad_entregada'],
                    'observaciones' => $ticket['observaciones']
                ],
                'solicitud' => [
                    'cantidad_litros' => $ticket['cantidad_litros'],
                    'tipo_solicitud' => $ticket['tipo_solicitud'],
                    'descripcion' => $ticket['solicitud_descripcion']
                ],
                'cliente' => [
                    'nombre' => $ticket['cliente_nombre'],
                    'telefono' => $ticket['cliente_telefono']
                ],
                'localidad' => [
                    'nombre' => $ticket['localidad_nombre'],
                    'direccion' => $ticket['localidad_direccion']
                ]
            ];
            
            $this->jsonResponse($response);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // PUT /api/tickets/{id}/llegada - Registrar llegada del cliente
    public function registrarLlegada($id) {
        try {
            $ticket = $this->ticketRepository->obtenerPorId($id);
            
            if (!$ticket) {
                $this->jsonResponse('Ticket no encontrado', 404);
                return;
            }
            
            if ($ticket['estado_entrega'] !== 'pendiente') {
                $this->jsonResponse('El ticket ya no está en estado pendiente', 400);
                return;
            }
            
            $resultado = $this->ticketRepository->registrarLlegada($id);
            
            if (!$resultado) {
                $this->jsonResponse('Error al registrar llegada', 500);
                return;
            }
            
            // También actualizar solicitud a "en_proceso"
            $this->solicitudRepository->actualizarEstado($ticket['solicitud_id'], 'en_proceso');
            
            $this->jsonResponse([
                'mensaje' => 'Llegada registrada correctamente',
                'ticket_id' => $id,
                'estado_nuevo' => 'en_proceso',
                'fecha_llegada' => date('Y-m-d H:i:s')
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // PUT /api/tickets/{id}/entrega - Registrar entrega
    public function registrarEntrega($id) {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['cantidad_entregada', 'estado_final']);
            
            $ticket = $this->ticketRepository->obtenerPorId($id);
            
            if (!$ticket) {
                $this->jsonResponse('Ticket no encontrado', 404);
                return;
            }
            
            if (!in_array($ticket['estado_entrega'], ['pendiente', 'en_proceso'])) {
                $this->jsonResponse('El ticket ya fue procesado', 400);
                return;
            }
            
            // Validar estado final
            $estadosValidos = ['entregado', 'parcial', 'cancelado'];
            if (!in_array($data['estado_final'], $estadosValidos)) {
                $this->jsonResponse('Estado final no válido. Debe ser: ' . implode(', ', $estadosValidos), 400);
                return;
            }
            
            $observaciones = $data['observaciones'] ?? '';
            
            // Iniciar transacción
            $db = \Config\Database::getInstance()->getConnection();
            $db->beginTransaction();
            
            try {
                // Registrar entrega en ticket
                $resultado = $this->ticketRepository->registrarEntrega(
                    $id, 
                    $data['cantidad_entregada'], 
                    $data['estado_final'], 
                    $observaciones
                );
                
                if (!$resultado) {
                    throw new \Exception('Error al registrar entrega en ticket');
                }
                
                // Actualizar estado de solicitud según el resultado
                $nuevoEstadoSolicitud = '';
                switch ($data['estado_final']) {
                    case 'entregado':
                        $nuevoEstadoSolicitud = 'completada';
                        break;
                    case 'parcial':
                        $nuevoEstadoSolicitud = 'en_proceso'; // Mantener en proceso para posible nueva entrega
                        break;
                    case 'cancelado':
                        $nuevoEstadoSolicitud = 'cancelada';
                        break;
                }
                
                if (!$this->solicitudRepository->actualizarEstado($ticket['solicitud_id'], $nuevoEstadoSolicitud)) {
                    throw new \Exception('Error al actualizar estado de solicitud');
                }
                
                $db->commit();
                
                $this->jsonResponse([
                    'mensaje' => 'Entrega registrada correctamente',
                    'ticket_id' => $id,
                    'estado_ticket' => $data['estado_final'],
                    'estado_solicitud' => $nuevoEstadoSolicitud,
                    'cantidad_entregada' => $data['cantidad_entregada']
                ]);
                
            } catch (\Exception $e) {
                $db->rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // GET /api/tickets/localidad/{localidad_id} - Tickets pendientes por localidad
    public function obtenerPorLocalidad($localidadId) {
        try {
            if (!$this->localidadRepository->obtenerPorId($localidadId)) {
                $this->jsonResponse('Localidad no encontrada', 404);
                return;
            }
            
            $tickets = $this->ticketRepository->obtenerPendientesPorLocalidad($localidadId);
            
            // Formatear respuesta
            $ticketsFormateados = array_map(function($ticket) {
                return [
                    'id' => $ticket['id'],
                    'codigo' => $ticket['codigo_ticket'],
                    'estado' => $ticket['estado_entrega'],
                    'fecha_llegada' => $ticket['fecha_llegada'],
                    'solicitud' => [
                        'cantidad_litros' => $ticket['cantidad_litros'],
                        'tipo_solicitud' => $ticket['tipo_solicitud']
                    ],
                    'cliente' => [
                        'nombre' => $ticket['cliente_nombre'],
                        'telefono' => $ticket['cliente_telefono']
                    ]
                ];
            }, $tickets);
            
            $this->jsonResponse([
                'localidad_id' => $localidadId,
                'total_tickets' => count($ticketsFormateados),
                'tickets' => $ticketsFormateados
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/tickets/encargado/{encargado_id} - Tickets por encargado
    public function obtenerPorEncargado($encargadoId) {
        try {
            $fecha = $_GET['fecha'] ?? null; // Opcional: filtrar por fecha
            
            $tickets = $this->ticketRepository->obtenerPorEncargado($encargadoId, $fecha);
            
            // Formatear respuesta con estadísticas
            $estadisticas = [
                'pendiente' => 0,
                'en_proceso' => 0,
                'entregado' => 0,
                'cancelado' => 0,
                'parcial' => 0
            ];
            
            $ticketsFormateados = array_map(function($ticket) use (&$estadisticas) {
                $estadisticas[$ticket['estado_entrega']]++;
                
                return [
                    'id' => $ticket['id'],
                    'codigo' => $ticket['codigo_ticket'],
                    'estado' => $ticket['estado_entrega'],
                    'fecha_llegada' => $ticket['fecha_llegada'],
                    'cantidad_entregada' => $ticket['cantidad_entregada'],
                    'solicitud' => [
                        'cantidad_litros' => $ticket['cantidad_litros'],
                        'tipo_solicitud' => $ticket['tipo_solicitud']
                    ],
                    'cliente' => [
                        'nombre' => $ticket['cliente_nombre']
                    ],
                    'localidad' => [
                        'nombre' => $ticket['localidad_nombre']
                    ]
                ];
            }, $tickets);
            
            $this->jsonResponse([
                'encargado_id' => $encargadoId,
                'fecha_filtro' => $fecha ?? 'todas',
                'estadisticas' => $estadisticas,
                'total_tickets' => count($ticketsFormateados),
                'tickets' => $ticketsFormateados
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/solicitudes/{id}/ticket - Obtener ticket de una solicitud
    public function obtenerTicketDeSolicitud($id) {
        try {
            if (!$this->solicitudRepository->existe($id)) {
                $this->jsonResponse('Solicitud no encontrada', 404);
                return;
            }
            
            $ticket = $this->ticketRepository->obtenerPorSolicitud($id);
            
            if (!$ticket) {
                $this->jsonResponse('Esta solicitud no tiene ticket asignado', 404);
                return;
            }
            
            $this->jsonResponse([
                'solicitud_id' => $id,
                'ticket' => [
                    'id' => $ticket['id'],
                    'codigo' => $ticket['codigo_ticket'],
                    'estado' => $ticket['estado_entrega'],
                    'fecha_llegada' => $ticket['fecha_llegada'],
                    'cantidad_entregada' => $ticket['cantidad_entregada'],
                    'observaciones' => $ticket['observaciones']
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
}
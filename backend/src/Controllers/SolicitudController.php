<?php
namespace Controllers;

use Services\SolicitudService;
use Core\Factory\SolicitudFactory;
use Database\SolicitudRepository;

class SolicitudController extends BaseController {
    private $solicitudService;
    private $repository;
    
    public function __construct() {
        $this->solicitudService = new SolicitudService();
        $this->repository = new SolicitudRepository();
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
    
    // GET /api/solicitudes/{id}
    public function obtener($id) {
        try {
            $solicitud = $this->repository->obtenerPorId($id);
            if (!$solicitud) {
                $this->jsonResponse('Solicitud no encontrada', 404);
            }
            
            $this->jsonResponse($solicitud);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // PUT /api/solicitudes/{id}/asignar
    public function asignar($id) {
        try {
            // Aquí reconstruiríamos el objeto desde BD y aplicaríamos State Pattern
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['localidad_id', 'asesor_id']);
            
            // Simular asignación (luego implementar con State Pattern completo)
            $this->jsonResponse([
                'mensaje' => 'Solicitud asignada correctamente',
                'solicitud_id' => $id,
                'localidad_id' => $data['localidad_id']
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // PUT /api/solicitudes/{id}/estado
    public function cambiarEstado($id) {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['accion']);
            
            // Aquí aplicaríamos State Pattern
            $mensaje = "Estado cambiado: " . $data['accion'];
            
            $this->jsonResponse([
                'mensaje' => $mensaje,
                'solicitud_id' => $id,
                'nueva_accion' => $data['accion']
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // GET /api/solicitudes
    public function listar() {
        try {
            $solicitudes = $this->repository->obtenerTodas();
            $this->jsonResponse($solicitudes);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
}
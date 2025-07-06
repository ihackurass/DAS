<?php
namespace Services;

use Core\Factory\SolicitudFactory;
use Database\SolicitudRepository;
use Services\NotificationService;

class SolicitudService {
    private $repository;
    private $notificationService;
    
    public function __construct() {
        $this->repository = new SolicitudRepository();
        $this->notificationService = NotificationService::getInstance();
    }
    
    public function crearSolicitud($tipo, $usuarioId, $cantidadLitros, $descripcion = '') {
        try {
            // 1. Crear solicitud con Factory
            $solicitud = SolicitudFactory::crear($tipo, $usuarioId, $cantidadLitros, $descripcion);
            
            // 2. Validar
            $solicitud->validar();
            
            // 3. Guardar en BD
            if ($this->repository->guardar($solicitud)) {
                // 4. Notificar con Observer
                $this->notificationService->nuevaSolicitud($solicitud);
                
                return $solicitud;
            } else {
                throw new \Exception("Error al guardar solicitud en BD");
            }
            
        } catch (\Exception $e) {
            throw new \Exception("Error al crear solicitud: " . $e->getMessage());
        }
    }
}
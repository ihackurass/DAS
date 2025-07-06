<?php
namespace Core\State;

class EstadoEnProceso implements EstadoSolicitudInterface {
    public function asignar($solicitud) {
        throw new \Exception("No se puede reasignar una solicitud en proceso");
    }
    
    public function procesar($solicitud) {
        throw new \Exception("La solicitud ya está en proceso");
    }
    
    public function completar($solicitud) {
        $solicitud->setEstado(new EstadoCompletada());
        return "Solicitud completada exitosamente";
    }
    
    public function cancelar($solicitud) {
        // En proceso se puede cancelar pero con más restricciones
        $solicitud->setEstado(new EstadoCancelada());
        return "Solicitud en proceso cancelada";
    }
    
    public function getNombre() {
        return 'en_proceso';
    }
}
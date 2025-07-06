<?php
namespace Core\State;

class EstadoPendiente implements EstadoSolicitudInterface {
    public function asignar($solicitud) {
        $solicitud->setEstado(new EstadoAsignada());
        return "Solicitud asignada a localidad";
    }
    
    public function procesar($solicitud) {
        throw new \Exception("No se puede procesar una solicitud pendiente sin asignar");
    }
    
    public function completar($solicitud) {
        throw new \Exception("No se puede completar una solicitud pendiente");
    }
    
    public function cancelar($solicitud) {
        $solicitud->setEstado(new EstadoCancelada());
        return "Solicitud cancelada";
    }
    
    public function getNombre() {
        return 'pendiente';
    }
}
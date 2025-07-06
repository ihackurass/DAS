<?php
namespace Core\State;

class EstadoCancelada implements EstadoSolicitudInterface {
    public function asignar($solicitud) {
        throw new \Exception("No se puede asignar una solicitud cancelada");
    }
    
    public function procesar($solicitud) {
        throw new \Exception("No se puede procesar una solicitud cancelada");
    }
    
    public function completar($solicitud) {
        throw new \Exception("No se puede completar una solicitud cancelada");
    }
    
    public function cancelar($solicitud) {
        throw new \Exception("La solicitud ya está cancelada");
    }
    
    public function getNombre() {
        return 'cancelada';
    }
}
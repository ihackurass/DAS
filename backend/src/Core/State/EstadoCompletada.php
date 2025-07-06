<?php
namespace Core\State;

class EstadoCompletada implements EstadoSolicitudInterface {
    public function asignar($solicitud) {
        throw new \Exception("No se puede modificar una solicitud completada");
    }
    
    public function procesar($solicitud) {
        throw new \Exception("No se puede modificar una solicitud completada");
    }
    
    public function completar($solicitud) {
        throw new \Exception("La solicitud ya está completada");
    }
    
    public function cancelar($solicitud) {
        throw new \Exception("No se puede cancelar una solicitud completada");
    }
    
    public function getNombre() {
        return 'completada';
    }
}
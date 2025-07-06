<?php
namespace Core\State;

class EstadoAsignada implements EstadoSolicitudInterface {
    public function asignar($solicitud) {
        throw new \Exception("La solicitud ya está asignada");
    }
    
    public function procesar($solicitud) {
        $solicitud->setEstado(new EstadoEnProceso());
        return "Solicitud en proceso de entrega";
    }
    
    public function completar($solicitud) {
        throw new \Exception("No se puede completar sin procesar primero");
    }
    
    public function cancelar($solicitud) {
        $solicitud->setEstado(new EstadoCancelada());
        return "Solicitud asignada cancelada";
    }
    
    public function getNombre() {
        return 'asignada';
    }
}
<?php
namespace Core\Factory;

class SolicitudUrgente extends Solicitud {
    protected $tipo = 'urgente';
    
    public function validar() {
        if ($this->cantidadLitros > 1000) {
            throw new \Exception("Solicitud urgente no puede exceder 1000 litros");
        }
        return true;
    }
    
    public function getPrioridad() {
        return 1;
    }
    
    public function calcularFechaLimite() {
        return date('Y-m-d H:i:s', strtotime('+2 hours'));
    }
}
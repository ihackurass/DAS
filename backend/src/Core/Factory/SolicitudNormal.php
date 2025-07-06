<?php
namespace Core\Factory;

class SolicitudNormal extends Solicitud {
    protected $tipo = 'normal';
    
    public function validar() {
        if ($this->cantidadLitros > 5000) {
            throw new \Exception("Solicitud normal no puede exceder 5000 litros");
        }
        return true;
    }
    
    public function getPrioridad() {
        return 2;
    }
    
    public function calcularFechaLimite() {
        return date('Y-m-d H:i:s', strtotime('+1 day'));
    }
}
<?php
namespace Core\Factory;

class SolicitudComercial extends Solicitud {
    protected $tipo = 'comercial';
    
    public function validar() {
        if ($this->cantidadLitros < 1000) {
            throw new \Exception("Solicitud comercial mínimo 1000 litros");
        }
        return true;
    }
    
    public function getPrioridad() {
        return 3;
    }
    
    public function calcularFechaLimite() {
        return date('Y-m-d H:i:s', strtotime('+3 days'));
    }
}
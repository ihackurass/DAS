<?php
namespace Services\Observers;

use Core\Observer\ObserverInterface;

class EstadisticasObserver implements ObserverInterface {
    public function update($evento, $datos) {
        if ($evento === 'nueva_solicitud') {
            $this->actualizarEstadisticas($datos);
        }
    }
    
    private function actualizarEstadisticas($solicitud) {
        echo "✓ Estadísticas actualizadas para tipo: " . $solicitud->getTipo() . "\n";
    }
}
<?php
namespace Services\Observers;

use Core\Observer\ObserverInterface;

class EmailObserver implements ObserverInterface {
    public function update($evento, $datos) {
        if ($evento === 'nueva_solicitud') {
            $this->enviarEmailAsesor($datos);
        }
    }
    
    private function enviarEmailAsesor($solicitud) {
        echo "Email enviado para solicitud tipo: " . $solicitud->getTipo() . "\n";
    }
}
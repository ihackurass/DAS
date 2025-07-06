<?php
namespace Services\Observers;

use Core\Observer\ObserverInterface;

class LogObserver implements ObserverInterface {
    public function update($evento, $datos) {
        if ($evento === 'nueva_solicitud') {
            $this->registrarLog($datos);
        }
    }
   
    private function registrarLog($solicitud) {
        // Crear directorio si no existe
        $logDir = __DIR__ . '/../../../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $log = date('Y-m-d H:i:s') . " - Nueva solicitud ID: " . ($solicitud->getId() ?? 'temp') . 
               " Tipo: " . $solicitud->getTipo() . 
               " Usuario: " . $solicitud->getUsuarioId() . 
               " Cantidad: " . $solicitud->getCantidadLitros() . "L\n";
               
        file_put_contents($logDir . '/solicitudes.log', $log, FILE_APPEND | LOCK_EX);
        echo "✓ Log registrado\n";
    }
}
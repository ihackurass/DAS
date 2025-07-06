<?php
namespace Core\Command;

class CommandInvoker {
    private $historial = [];
    private $posicionActual = -1;
    
    public function ejecutar(CommandInterface $command) {
        $resultado = $command->ejecutar();
        
        // Agregar al historial
        $this->posicionActual++;
        $this->historial[$this->posicionActual] = $command;
        
        // Limpiar historial posterior si existe
        $this->historial = array_slice($this->historial, 0, $this->posicionActual + 1);
        
        // Log de auditoría
        $this->registrarEjecucion($command, $resultado);
        
        return $resultado;
    }
    
    public function deshacer() {
        if ($this->posicionActual >= 0) {
            $command = $this->historial[$this->posicionActual];
            $resultado = $command->deshacer();
            $this->posicionActual--;
            
            $this->registrarDeshacer($command, $resultado);
            return $resultado;
        }
        
        return "No hay comandos para deshacer";
    }
    
    public function rehacer() {
        if ($this->posicionActual < count($this->historial) - 1) {
            $this->posicionActual++;
            $command = $this->historial[$this->posicionActual];
            $resultado = $command->ejecutar();
            
            $this->registrarRehacer($command, $resultado);
            return $resultado;
        }
        
        return "No hay comandos para rehacer";
    }
    
    public function getHistorial() {
        return array_map(function($command) {
            return $command->getDescripcion();
        }, $this->historial);
    }
    
    private function registrarEjecucion($command, $resultado) {
        $resultadoStr = is_array($resultado) ? json_encode($resultado) : $resultado;
        $log = date('Y-m-d H:i:s') . " - EJECUTADO: " . $command->getDescripcion() . " - Resultado: $resultadoStr\n";
        file_put_contents('logs/comandos.log', $log, FILE_APPEND | LOCK_EX);
    }

    private function registrarDeshacer($command, $resultado) {
        $resultadoStr = is_array($resultado) ? json_encode($resultado) : $resultado;
        $log = date('Y-m-d H:i:s') . " - DESHECHO: " . $command->getDescripcion() . " - Resultado: $resultadoStr\n";
        file_put_contents('logs/comandos.log', $log, FILE_APPEND | LOCK_EX);
    }

    private function registrarRehacer($command, $resultado) {
        $resultadoStr = is_array($resultado) ? json_encode($resultado) : $resultado;
        $log = date('Y-m-d H:i:s') . " - REHECHO: " . $command->getDescripcion() . " - Resultado: $resultadoStr\n";
        file_put_contents('logs/comandos.log', $log, FILE_APPEND | LOCK_EX);
    }
}
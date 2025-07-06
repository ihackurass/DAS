<?php
namespace Core\Command;

use Services\NotificationService;

class NotificarAsesorCommand implements CommandInterface {
    private $solicitud;
    private $mensaje;
    private $ejecutado = false;
    
    public function __construct($solicitud, $mensaje = '') {
        $this->solicitud = $solicitud;
        $this->mensaje = $mensaje ?: "Nueva solicitud requerida atención";
    }
    
    public function ejecutar() {
        $notificationService = NotificationService::getInstance();
        $notificationService->nuevaSolicitud($this->solicitud);
        $this->ejecutado = true;
        
        return "Notificación enviada para solicitud ID: " . $this->solicitud->getId();
    }
    
    public function deshacer() {
        // En este caso no se puede "desenviar" una notificación
        // Pero podríamos registrar que fue deshecho
        if ($this->ejecutado) {
            echo "Nota: Notificación fue deshecha (registro interno)\n";
            $this->ejecutado = false;
            return "Comando de notificación deshecho";
        }
        return "Comando no se había ejecutado";
    }
    
    public function getDescripcion() {
        return "Notificar asesor sobre solicitud: " . $this->mensaje;
    }
}
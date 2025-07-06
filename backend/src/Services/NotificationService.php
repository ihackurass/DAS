<?php
namespace Services;

use Core\Observer\Subject;

class NotificationService extends Subject {
    private static $instance = null;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function nuevaSolicitud($solicitud) {
        $this->notify('nueva_solicitud', $solicitud);
    }
}
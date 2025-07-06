<?php
namespace Core\Observer;

class Subject {
    private $observers = [];
    
    public function attach(ObserverInterface $observer) {
        $this->observers[] = $observer;
    }
    
    public function detach(ObserverInterface $observer) {
        $key = array_search($observer, $this->observers);
        if ($key !== false) {
            unset($this->observers[$key]);
        }
    }
    
    public function notify($evento, $datos) {
        foreach ($this->observers as $observer) {
            $observer->update($evento, $datos);
        }
    }
}
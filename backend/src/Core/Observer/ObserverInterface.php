<?php
namespace Core\Observer;

interface ObserverInterface {
    public function update($evento, $datos);
}
<?php
namespace Core\Command;

interface CommandInterface {
    public function ejecutar();
    public function deshacer();
    public function getDescripcion();
}
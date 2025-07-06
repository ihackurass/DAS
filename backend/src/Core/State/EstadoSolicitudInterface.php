<?php
namespace Core\State;

interface EstadoSolicitudInterface {
    public function asignar($solicitud);
    public function procesar($solicitud);
    public function completar($solicitud);
    public function cancelar($solicitud);
    public function getNombre();
}
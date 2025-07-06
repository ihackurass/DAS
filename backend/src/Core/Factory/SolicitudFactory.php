<?php
namespace Core\Factory;

class SolicitudFactory {
    public static function crear($tipo, $usuarioId, $cantidadLitros, $descripcion = '') {
        switch ($tipo) {
            case 'urgente':
                return new SolicitudUrgente($usuarioId, $cantidadLitros, $descripcion);
            case 'normal':
                return new SolicitudNormal($usuarioId, $cantidadLitros, $descripcion);
            case 'comercial':
                return new SolicitudComercial($usuarioId, $cantidadLitros, $descripcion);
            default:
                throw new \Exception("Tipo de solicitud no válido: $tipo");
        }
    }
}
<?php
namespace Core\Strategy;

class BusquedaPorCapacidad implements BusquedaLocalidadInterface {
    public function buscar($solicitud, $localidades) {
        // Ordenar por mayor capacidad disponible
        usort($localidades, function($a, $b) {
            return $b['disponibilidad'] <=> $a['disponibilidad'];
        });
        
        return array_filter($localidades, function($localidad) use ($solicitud) {
            return $localidad['disponibilidad'] >= $solicitud->getCantidadLitros();
        });
    }
}
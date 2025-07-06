<?php
namespace Core\Strategy;

class BusquedaPorDistancia implements BusquedaLocalidadInterface {
    public function buscar($solicitud, $localidades) {
        // Ordenar por distancia (simulado con ID por ahora)
        usort($localidades, function($a, $b) {
            return $a['id'] <=> $b['id']; // Más cercano = ID menor
        });
        
        // Filtrar solo disponibles
        return array_filter($localidades, function($localidad) use ($solicitud) {
            return $localidad['disponibilidad'] >= $solicitud->getCantidadLitros();
        });
    }
}
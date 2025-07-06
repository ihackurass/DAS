<?php
namespace Core\Strategy;

class BusquedaPorDisponibilidad implements BusquedaLocalidadInterface {
    public function buscar($solicitud, $localidades) {
        // Priorizar localidades con stock exacto (evitar desperdicios)
        usort($localidades, function($a, $b) use ($solicitud) {
            $diffA = $a['disponibilidad'] - $solicitud->getCantidadLitros();
            $diffB = $b['disponibilidad'] - $solicitud->getCantidadLitros();
            
            // Menor diferencia positiva = mejor match
            if ($diffA >= 0 && $diffB >= 0) {
                return $diffA <=> $diffB;
            }
            
            return $b['disponibilidad'] <=> $a['disponibilidad'];
        });
        
        return array_filter($localidades, function($localidad) use ($solicitud) {
            return $localidad['disponibilidad'] >= $solicitud->getCantidadLitros();
        });
    }
}
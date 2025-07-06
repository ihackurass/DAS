<?php
namespace Core\Command;

use Database\ReporteRepository;
use Database\LocalidadRepository;

class GenerarReporteCommand implements CommandInterface {
    private $localidadId;
    private $tipoReporte;
    private $fechaInicio;
    private $fechaFin;
    private $encargadoId;
    private $reporteGenerado;
    private $repository;
    
    public function __construct($localidadId, $tipoReporte, $fechaInicio, $fechaFin, $encargadoId) {
        $this->localidadId = $localidadId;
        $this->tipoReporte = $tipoReporte;
        $this->fechaInicio = $fechaInicio;
        $this->fechaFin = $fechaFin;
        $this->encargadoId = $encargadoId;
        $this->repository = new ReporteRepository();
    }
    
    public function ejecutar() {
        // Generar datos del reporte
        $datosReporte = $this->calcularDatosReporte();
        
        // Guardar en BD
        $this->reporteGenerado = $this->repository->crear(
            $this->localidadId,
            $this->encargadoId,
            $this->tipoReporte,
            $this->fechaInicio,
            $this->fechaFin,
            $datosReporte['total_solicitudes'],
            $datosReporte['total_litros'],
            json_encode($datosReporte)
        );
        
        return $this->reporteGenerado;
    }
    
    public function deshacer() {
        if ($this->reporteGenerado) {
            $this->repository->eliminar($this->reporteGenerado['id']);
            $this->reporteGenerado = null;
            return "Reporte eliminado";
        }
        return "No hay reporte para deshacer";
    }
    
    public function getDescripcion() {
        return "Generar reporte {$this->tipoReporte} para localidad {$this->localidadId} del {$this->fechaInicio} al {$this->fechaFin}";
    }
    
    private function calcularDatosReporte() {
        // Simular cálculo de datos
        return [
            'total_solicitudes' => rand(10, 100),
            'total_litros' => rand(5000, 50000),
            'solicitudes_urgentes' => rand(1, 20),
            'solicitudes_normales' => rand(5, 60),
            'solicitudes_comerciales' => rand(2, 20),
            'promedio_diario' => rand(100, 1000)
        ];
    }
}
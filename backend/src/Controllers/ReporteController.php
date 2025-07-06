<?php
namespace Controllers;

use Core\Command\GenerarReporteCommand;
use Core\Command\CommandInvoker;
use Database\ReporteRepository;

class ReporteController extends BaseController {
    private $repository;
    private $invoker;
    
    public function __construct() {
        $this->repository = new ReporteRepository();
        $this->invoker = new CommandInvoker();
    }
    
    // POST /api/reportes
    public function generar() {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['localidad_id', 'tipo_reporte', 'fecha_inicio', 'fecha_fin', 'encargado_id']);
            
            $command = new GenerarReporteCommand(
                $data['localidad_id'],
                $data['tipo_reporte'],
                $data['fecha_inicio'],
                $data['fecha_fin'],
                $data['encargado_id']
            );
            
            $reporte = $this->invoker->ejecutar($command);
            
            $this->jsonResponse([
                'reporte' => $reporte,
                'mensaje' => 'Reporte generado exitosamente',
                'comando_ejecutado' => $command->getDescripcion()
            ], 201);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // GET /api/reportes/{id}
    public function obtener($id) {
        try {
            $reporte = $this->repository->obtenerPorId($id);
            if (!$reporte) {
                $this->jsonResponse('Reporte no encontrado', 404);
            }
            
            // Decodificar datos JSON para el frontend
            $reporte['datos_detallados'] = json_decode($reporte['datos_json'], true);
            
            $this->jsonResponse($reporte);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/reportes/localidad/{localidadId}
    public function obtenerPorLocalidad($localidadId) {
        try {
            $limite = $_GET['limite'] ?? 10;
            $reportes = $this->repository->obtenerPorLocalidad($localidadId, $limite);
            
            $this->jsonResponse([
                'reportes' => $reportes,
                'localidad_id' => $localidadId,
                'total' => count($reportes)
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // DELETE /api/reportes/{id}
    public function eliminar($id) {
        try {
            $resultado = $this->repository->eliminar($id);
            
            if ($resultado) {
                $this->jsonResponse([
                    'mensaje' => 'Reporte eliminado',
                    'reporte_id' => $id
                ]);
            } else {
                $this->jsonResponse('Error al eliminar reporte', 500);
            }
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // GET /api/reportes/comandos/historial
    public function historialComandos() {
        try {
            $historial = $this->invoker->getHistorial();
            
            $this->jsonResponse([
                'historial' => $historial,
                'total_comandos' => count($historial)
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // POST /api/reportes/comandos/deshacer
    public function deshacerComando() {
        try {
            $resultado = $this->invoker->deshacer();
            
            $this->jsonResponse([
                'mensaje' => $resultado,
                'accion' => 'deshacer'
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
}
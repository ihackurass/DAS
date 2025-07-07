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
    public function resumenGeneral() {
        try {
            $db = \Config\Database::getInstance()->getConnection();
            
            // Estadísticas básicas
            $stmt = $db->query("
                SELECT 
                    (SELECT COUNT(*) FROM solicitudes) as total_solicitudes,
                    (SELECT COUNT(*) FROM solicitudes WHERE estado = 'pendiente') as solicitudes_pendientes,
                    (SELECT COUNT(*) FROM solicitudes WHERE estado = 'completada') as solicitudes_completadas,
                    (SELECT COUNT(*) FROM solicitudes WHERE estado = 'cancelada') as solicitudes_canceladas,
                    (SELECT COUNT(*) FROM tickets WHERE estado_entrega = 'entregado') as total_entregas,
                    (SELECT COALESCE(SUM(cantidad_entregada), 0) FROM tickets WHERE estado_entrega = 'entregado') as total_litros_entregados,
                    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
                    (SELECT COUNT(*) FROM localidades WHERE activo = 1) as total_localidades
            ");
            $stats = $stmt->fetch();
            
            // Calcular promedio y eficiencia
            $stats['promedio_litros'] = $stats['total_entregas'] > 0 ? 
                round($stats['total_litros_entregados'] / $stats['total_entregas']) : 0;
            $stats['eficiencia_entregas'] = $stats['total_solicitudes'] > 0 ? 
                round(($stats['solicitudes_completadas'] / $stats['total_solicitudes']) * 100) : 0;
            
            // Top localidades
            $stmt = $db->query("
                SELECT l.nombre, COUNT(t.id) as total_entregas
                FROM localidades l
                LEFT JOIN asignaciones a ON l.id = a.localidad_id
                LEFT JOIN tickets t ON a.solicitud_id = t.solicitud_id AND t.estado_entrega = 'entregado'
                WHERE l.activo = 1
                GROUP BY l.id, l.nombre
                HAVING total_entregas > 0
                ORDER BY total_entregas DESC
                LIMIT 5
            ");
            $stats['top_localidades'] = $stmt->fetchAll();
            
            $this->jsonResponse($stats);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
}
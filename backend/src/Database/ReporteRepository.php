<?php
namespace Database;

use Config\Database;

class ReporteRepository {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function crear($localidadId, $encargadoId, $tipoReporte, $fechaInicio, $fechaFin, $totalSolicitudes, $totalLitros, $datosJson) {
        $sql = "INSERT INTO reportes (localidad_id, encargado_id, tipo_reporte, fecha_inicio, fecha_fin, total_solicitudes, total_litros_entregados, datos_json, fecha_generacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $localidadId,
            $encargadoId,
            $tipoReporte,
            $fechaInicio,
            $fechaFin,
            $totalSolicitudes,
            $totalLitros,
            $datosJson
        ]);
        
        if ($result) {
            $id = $this->db->lastInsertId();
            return [
                'id' => $id,
                'localidad_id' => $localidadId,
                'encargado_id' => $encargadoId,
                'tipo_reporte' => $tipoReporte,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'total_solicitudes' => $totalSolicitudes,
                'total_litros_entregados' => $totalLitros,
                'datos_json' => $datosJson
            ];
        }
        
        return false;
    }
    
    public function obtenerPorId($id) {
        $sql = "SELECT * FROM reportes WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function eliminar($id) {
        $sql = "DELETE FROM reportes WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function obtenerPorLocalidad($localidadId, $limite = 10) {
        $sql = "SELECT * FROM reportes WHERE localidad_id = ? ORDER BY fecha_generacion DESC LIMIT ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$localidadId, $limite]);
        return $stmt->fetchAll();
    }
}
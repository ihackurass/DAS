<?php
namespace Database;

use Config\Database;

class AsignacionRepository {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Crear nueva asignación
     */
    public function crear($solicitudId, $localidadId, $asesorId, $observaciones = '') {
        $sql = "INSERT INTO asignaciones (solicitud_id, localidad_id, asesor_id, observaciones) 
                VALUES (?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([$solicitudId, $localidadId, $asesorId, $observaciones]);
        
        if ($result) {
            return [
                'id' => $this->db->lastInsertId(),
                'solicitud_id' => $solicitudId,
                'localidad_id' => $localidadId,
                'asesor_id' => $asesorId,
                'observaciones' => $observaciones,
                'fecha_asignacion' => date('Y-m-d H:i:s')
            ];
        }
        
        return false;
    }
    
    /**
     * Obtener asignación por solicitud ID
     */
    public function obtenerPorSolicitud($solicitudId) {
        $sql = "SELECT * FROM asignaciones WHERE solicitud_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$solicitudId]);
        return $stmt->fetch();
    }
    
    /**
     * Obtener detalles completos de asignación
     */
    public function obtenerDetallesCompletos($solicitudId) {
        $sql = "SELECT 
                    s.id as solicitud_id,
                    s.cantidad_litros,
                    s.tipo_solicitud,
                    s.estado,
                    s.descripcion as descripcion_solicitud,
                    s.fecha_solicitud,
                    l.id as localidad_id,
                    l.nombre as localidad_nombre,
                    l.direccion as localidad_direccion,
                    l.latitud,
                    l.longitud,
                    u.id as asesor_id,
                    u.nombre as asesor_nombre,
                    u.telefono as asesor_telefono,
                    a.observaciones as comentario_asesor,
                    a.fecha_asignacion,
                    enc.nombre as encargado_nombre,
                    enc.telefono as encargado_telefono,
                    t.codigo_ticket,
                    t.estado_entrega as ticket_estado,
                    t.fecha_llegada as ticket_fecha_llegada,
                    t.cantidad_entregada as ticket_cantidad_entregada,
                    t.observaciones as ticket_observaciones
                FROM solicitudes s
                LEFT JOIN asignaciones a ON s.id = a.solicitud_id
                LEFT JOIN localidades l ON a.localidad_id = l.id
                LEFT JOIN usuarios u ON a.asesor_id = u.id
                LEFT JOIN usuarios enc ON l.encargado_id = enc.id
                LEFT JOIN tickets t ON s.id = t.solicitud_id
                WHERE s.id = ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$solicitudId]);
        return $stmt->fetch();
    }
    
    /**
     * Obtener asignaciones por asesor
     */
    public function obtenerPorAsesor($asesorId, $limite = 20) {
        $sql = "SELECT 
                    a.*,
                    s.cantidad_litros,
                    s.tipo_solicitud,
                    s.estado,
                    l.nombre as localidad_nombre,
                    u.nombre as cliente_nombre
                FROM asignaciones a
                JOIN solicitudes s ON a.solicitud_id = s.id
                JOIN localidades l ON a.localidad_id = l.id
                JOIN usuarios u ON s.usuario_id = u.id
                WHERE a.asesor_id = ?
                ORDER BY a.fecha_asignacion DESC
                LIMIT ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$asesorId, $limite]);
        return $stmt->fetchAll();
    }
    
    /**
     * Obtener asignaciones por localidad
     */
    public function obtenerPorLocalidad($localidadId, $limite = 20) {
        $sql = "SELECT 
                    a.*,
                    s.cantidad_litros,
                    s.tipo_solicitud,
                    s.estado,
                    u_cliente.nombre as cliente_nombre,
                    u_asesor.nombre as asesor_nombre
                FROM asignaciones a
                JOIN solicitudes s ON a.solicitud_id = s.id
                JOIN usuarios u_cliente ON s.usuario_id = u_cliente.id
                JOIN usuarios u_asesor ON a.asesor_id = u_asesor.id
                WHERE a.localidad_id = ?
                ORDER BY a.fecha_asignacion DESC
                LIMIT ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$localidadId, $limite]);
        return $stmt->fetchAll();
    }
}
<?php
namespace Database;

use Config\Database;
use Core\Factory\Solicitud;

class SolicitudRepository {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function guardar(Solicitud $solicitud) {
        $sql = "INSERT INTO solicitudes (usuario_id, cantidad_litros, tipo_solicitud, estado, descripcion, fecha_solicitud, fecha_limite) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $solicitud->getUsuarioId(),
            $solicitud->getCantidadLitros(),
            $solicitud->getTipo(),
            $solicitud->getEstado(),
            $solicitud->getDescripcion(),
            $solicitud->getFechaSolicitud(),
            $solicitud->getFechaLimite()
        ]);
        
        if ($result) {
            $solicitud->setId($this->db->lastInsertId());
            return true;
        }
        
        return false;
    }
    
    public function obtenerPorId($id) {
        $sql = "SELECT * FROM solicitudes WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function obtenerTodas() {
        $sql = "SELECT s.*, u.nombre as usuario_nombre 
                FROM solicitudes s 
                JOIN usuarios u ON s.usuario_id = u.id 
                ORDER BY s.fecha_solicitud DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function obtenerPorUsuario($usuarioId) {
        $sql = "SELECT * FROM solicitudes WHERE usuario_id = ? ORDER BY fecha_solicitud DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$usuarioId]);
        return $stmt->fetchAll();
    }

    public function obtenerPorEstado($estado) {
        $sql = "SELECT s.*, u.nombre as usuario_nombre 
                FROM solicitudes s 
                JOIN usuarios u ON s.usuario_id = u.id 
                WHERE s.estado = ? 
                ORDER BY s.fecha_solicitud DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$estado]);
        return $stmt->fetchAll();
    }
    
    // ← NUEVOS MÉTODOS AGREGADOS
    
    /**
     * Actualizar estado de solicitud
     */
    public function actualizarEstado($id, $nuevoEstado) {
        $sql = "UPDATE solicitudes SET estado = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$nuevoEstado, $id]);
    }
    
    /**
     * Verificar si solicitud está pendiente
     */
    public function estaPendiente($id) {
        $sql = "SELECT id FROM solicitudes WHERE id = ? AND estado = 'pendiente'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch() !== false;
    }
    
    /**
     * Verificar si solicitud existe
     */
    public function existe($id) {
        $sql = "SELECT id FROM solicitudes WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch() !== false;
    }
    
    /**
     * Obtener estadísticas por usuario
     */
    public function obtenerEstadisticas($usuarioId = null) {
        $whereClause = "";
        $params = [];
        
        if ($usuarioId) {
            $whereClause = "WHERE usuario_id = ?";
            $params = [$usuarioId];
        }
        
        $sql = "SELECT 
                    estado,
                    COUNT(*) as cantidad,
                    SUM(cantidad_litros) as total_litros
                FROM solicitudes 
                {$whereClause}
                GROUP BY estado";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    /**
     * Obtener solicitudes con asignación completa
     */
    public function obtenerConAsignacion($usuarioId = null) {
        $whereClause = "";
        $params = [];
        
        if ($usuarioId) {
            $whereClause = "WHERE s.usuario_id = ?";
            $params = [$usuarioId];
        }
        
        $sql = "SELECT 
                    s.*,
                    l.nombre as localidad_nombre,
                    l.direccion as localidad_direccion,
                    u_asesor.nombre as asesor_nombre,
                    a.observaciones as comentario_asesor,
                    t.codigo_ticket,
                    t.estado_entrega as ticket_estado
                FROM solicitudes s
                LEFT JOIN asignaciones a ON s.id = a.solicitud_id
                LEFT JOIN localidades l ON a.localidad_id = l.id
                LEFT JOIN usuarios u_asesor ON a.asesor_id = u_asesor.id
                LEFT JOIN tickets t ON s.id = t.solicitud_id
                {$whereClause}
                ORDER BY s.fecha_solicitud DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
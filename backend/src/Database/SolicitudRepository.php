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
}
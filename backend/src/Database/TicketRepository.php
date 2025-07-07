<?php
namespace Database;

use Config\Database;

class TicketRepository {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Generar código único para ticket
     */
    public function generarCodigoUnico() {
        // Obtener el último ID para generar código único
        $stmt = $this->db->prepare("SELECT MAX(id) as max_id FROM tickets");
        $stmt->execute();
        $result = $stmt->fetch();
        $nextId = ($result['max_id'] ?? 0) + 1;
        
        // Formato: TKT-AÑO-NÚMERO (ej: TKT-2025-001)
        return 'TKT-' . date('Y') . '-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
    }
    
    /**
     * Crear nuevo ticket
     */
    public function crear($solicitudId, $codigoTicket = null) {
        if (!$codigoTicket) {
            $codigoTicket = $this->generarCodigoUnico();
        }
        
        $sql = "INSERT INTO tickets (solicitud_id, codigo_ticket, estado_entrega) 
                VALUES (?, ?, 'pendiente')";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([$solicitudId, $codigoTicket]);
        
        if ($result) {
            return [
                'id' => $this->db->lastInsertId(),
                'solicitud_id' => $solicitudId,
                'codigo_ticket' => $codigoTicket,
                'estado_entrega' => 'pendiente'
            ];
        }
        
        return false;
    }
    
    /**
     * Buscar ticket por código
     */
    public function buscarPorCodigo($codigo) {
        $sql = "SELECT 
                    t.*,
                    s.cantidad_litros,
                    s.tipo_solicitud,
                    s.descripcion as solicitud_descripcion,
                    u.nombre as cliente_nombre,
                    u.telefono as cliente_telefono,
                    l.nombre as localidad_nombre,
                    l.direccion as localidad_direccion
                FROM tickets t
                JOIN solicitudes s ON t.solicitud_id = s.id
                JOIN usuarios u ON s.usuario_id = u.id
                JOIN asignaciones a ON s.id = a.solicitud_id
                JOIN localidades l ON a.localidad_id = l.id
                WHERE t.codigo_ticket = ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$codigo]);
        return $stmt->fetch();
    }
    
    /**
     * Obtener ticket por ID
     */
    public function obtenerPorId($id) {
        $sql = "SELECT * FROM tickets WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    /**
     * Obtener ticket por solicitud ID
     */
    public function obtenerPorSolicitud($solicitudId) {
        $sql = "SELECT * FROM tickets WHERE solicitud_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$solicitudId]);
        return $stmt->fetch();
    }
    
    /**
     * Registrar llegada del cliente
     */
    public function registrarLlegada($ticketId) {
        $sql = "UPDATE tickets SET 
                estado_entrega = 'en_proceso', 
                fecha_llegada = NOW() 
                WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$ticketId]);
    }
    
    /**
     * Registrar entrega
     */
    public function registrarEntrega($ticketId, $cantidadEntregada, $estadoFinal, $observaciones = '') {
        $sql = "UPDATE tickets SET 
                estado_entrega = ?, 
                cantidad_entregada = ?,
                observaciones = ?
                WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$estadoFinal, $cantidadEntregada, $observaciones, $ticketId]);
    }
    
    /**
     * Obtener tickets pendientes por localidad
     */
    public function obtenerPendientesPorLocalidad($localidadId) {
        $sql = "SELECT 
                    t.*,
                    s.cantidad_litros,
                    s.tipo_solicitud,
                    u.nombre as cliente_nombre,
                    u.telefono as cliente_telefono
                FROM tickets t
                JOIN solicitudes s ON t.solicitud_id = s.id
                JOIN usuarios u ON s.usuario_id = u.id
                JOIN asignaciones a ON s.id = a.solicitud_id
                WHERE a.localidad_id = ? 
                AND t.estado_entrega IN ('pendiente', 'en_proceso')
                ORDER BY s.fecha_solicitud ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$localidadId]);
        return $stmt->fetchAll();
    }
    
    /**
     * Obtener tickets por encargado
     */
    public function obtenerPorEncargado($encargadoId, $fecha = null) {
        $whereClause = "l.encargado_id = ?";
        $params = [$encargadoId];
        
        if ($fecha) {
            $whereClause .= " AND DATE(t.fecha_llegada) = ?";
            $params[] = $fecha;
        }
        
        $sql = "SELECT 
                    t.*,
                    s.cantidad_litros,
                    s.tipo_solicitud,
                    u.nombre as cliente_nombre,
                    l.nombre as localidad_nombre
                FROM tickets t
                JOIN solicitudes s ON t.solicitud_id = s.id
                JOIN usuarios u ON s.usuario_id = u.id
                JOIN asignaciones a ON s.id = a.solicitud_id
                JOIN localidades l ON a.localidad_id = l.id
                WHERE {$whereClause}
                ORDER BY t.fecha_llegada DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
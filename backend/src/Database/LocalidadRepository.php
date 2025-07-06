<?php
namespace Database;

use Config\Database;

class LocalidadRepository {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function obtenerActivas() {
        $sql = "SELECT * FROM localidades WHERE activo = 1 ORDER BY nombre";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function obtenerPorId($id) {
        $sql = "SELECT * FROM localidades WHERE id = ? AND activo = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function obtenerDisponibles($cantidadMinima) {
        $sql = "SELECT * FROM localidades WHERE disponibilidad >= ? AND activo = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cantidadMinima]);
        return $stmt->fetchAll();
    }
    
    public function actualizarDisponibilidad($id, $nuevaCantidad) {
        $sql = "UPDATE localidades SET disponibilidad = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$nuevaCantidad, $id]);
    }
    
    public function reducirDisponibilidad($id, $cantidadUsada) {
        $sql = "UPDATE localidades SET disponibilidad = disponibilidad - ? WHERE id = ? AND disponibilidad >= ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$cantidadUsada, $id, $cantidadUsada]);
    }
}
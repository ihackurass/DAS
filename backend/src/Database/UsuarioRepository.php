<?php
namespace Database;

use Config\Database;

class UsuarioRepository {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function crear($nombre, $email, $password, $rol, $telefono = null) {
        $sql = "INSERT INTO usuarios (nombre, email, password, rol, telefono) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        
        if ($stmt->execute([$nombre, $email, $password, $rol, $telefono])) {
            return $this->db->lastInsertId();
        }
        
        return false;
    }
    
    public function obtenerPorId($id) {
        $sql = "SELECT * FROM usuarios WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function obtenerPorEmail($email) {
        $sql = "SELECT * FROM usuarios WHERE email = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$email]);
        return $stmt->fetch();
    }
    
    public function obtenerPorRol($rol) {
        $sql = "SELECT id, nombre, email, rol, telefono, created_at FROM usuarios WHERE rol = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$rol]);
        return $stmt->fetchAll();
    }
    
    public function actualizar($id, $datos) {
        $campos = [];
        $valores = [];
        
        foreach ($datos as $campo => $valor) {
            if ($campo !== 'id') {
                $campos[] = "$campo = ?";
                $valores[] = $valor;
            }
        }
        
        $valores[] = $id;
        $sql = "UPDATE usuarios SET " . implode(', ', $campos) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($valores);
    }
}
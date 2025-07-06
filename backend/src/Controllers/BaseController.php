<?php
namespace Controllers;

abstract class BaseController {
    protected function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        if ($status >= 400) {
            echo json_encode(['error' => $data]);
        } else {
            echo json_encode(['data' => $data, 'status' => 'success']);
        }
        exit;
    }
    
    protected function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }
    
    protected function validateRequired($data, $fields) {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new \Exception("Campo requerido: $field");
            }
        }
    }
    protected function validateToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            // Por ahora solo verificar que existe
            // En producción verificar JWT
            return !empty($token);
        }
        
        return false;
    }

    protected function requireAuth() {
        if (!$this->validateToken()) {
            http_response_code(401);
            echo json_encode(['error' => 'Token requerido']);
            exit;
        }
    }
}
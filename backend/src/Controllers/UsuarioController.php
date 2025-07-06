<?php
namespace Controllers;

use Database\UsuarioRepository;

class UsuarioController extends BaseController {
    private $repository;
    
    public function __construct() {
        $this->repository = new UsuarioRepository();
    }
    
    // POST /api/usuarios/login
    public function login() {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['email', 'password']);
            
            $usuario = $this->repository->obtenerPorEmail($data['email']);
            
            if (!$usuario || !password_verify($data['password'], $usuario['password'])) {
                $this->jsonResponse('Credenciales inválidas', 401);
            }
            
            // Simular token (en producción usar JWT)
            $token = base64_encode($usuario['id'] . ':' . time());
            
            $this->jsonResponse([
                'usuario' => [
                    'id' => $usuario['id'],
                    'nombre' => $usuario['nombre'],
                    'email' => $usuario['email'],
                    'rol' => $usuario['rol']
                ],
                'token' => $token
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // POST /api/usuarios/registro
    public function registro() {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['nombre', 'email', 'password', 'rol']);
            
            $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
            
            $usuarioId = $this->repository->crear(
                $data['nombre'],
                $data['email'],
                $passwordHash,
                $data['rol'],
                $data['telefono'] ?? null
            );
            
            if ($usuarioId) {
                $usuario = $this->repository->obtenerPorId($usuarioId);
                
                $this->jsonResponse([
                    'usuario' => [
                        'id' => $usuario['id'],
                        'nombre' => $usuario['nombre'],
                        'email' => $usuario['email'],
                        'rol' => $usuario['rol']
                    ],
                    'mensaje' => 'Usuario creado exitosamente'
                ], 201);
            } else {
                $this->jsonResponse('Error al crear usuario', 500);
            }
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // GET /api/usuarios/perfil/{id}
    public function perfil($id) {
        try {
            $usuario = $this->repository->obtenerPorId($id);
            
            if (!$usuario) {
                $this->jsonResponse('Usuario no encontrado', 404);
            }
            
            // No devolver password
            unset($usuario['password']);
            
            $this->jsonResponse($usuario);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/usuarios/asesores
    public function obtenerAsesores() {
        try {
            $asesores = $this->repository->obtenerPorRol('asesor');
            
            $this->jsonResponse([
                'asesores' => $asesores,
                'total' => count($asesores)
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/usuarios/encargados
    public function obtenerEncargados() {
        try {
            $encargados = $this->repository->obtenerPorRol('encargado');
            
            $this->jsonResponse([
                'encargados' => $encargados,
                'total' => count($encargados)
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
}
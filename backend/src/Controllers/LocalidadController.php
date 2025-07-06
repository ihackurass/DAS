<?php
namespace Controllers;

use Services\LocalidadService;
use Core\Strategy\BusquedaPorDistancia;
use Core\Strategy\BusquedaPorCapacidad;
use Core\Strategy\BusquedaPorDisponibilidad;
use Database\LocalidadRepository;
use Core\Factory\SolicitudFactory;

class LocalidadController extends BaseController {
    private $localidadService;
    private $repository;
    
    public function __construct() {
        $this->repository = new LocalidadRepository();
    }
    
    // GET /api/localidades
    public function listar() {
        try {
            $localidades = $this->repository->obtenerActivas();
            $this->jsonResponse($localidades);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/localidades/{id}
    public function obtener($id) {
        try {
            $localidad = $this->repository->obtenerPorId($id);
            if (!$localidad) {
                $this->jsonResponse('Localidad no encontrada', 404);
            }
            
            $this->jsonResponse($localidad);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // POST /api/localidades/buscar
    public function buscarDisponibles() {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['cantidad_litros', 'estrategia']);
            
            // Crear solicitud temporal para búsqueda
            $solicitudTemp = SolicitudFactory::crear('normal', 1, $data['cantidad_litros']);
            
            // Seleccionar estrategia
            switch ($data['estrategia']) {
                case 'distancia':
                    $strategy = new BusquedaPorDistancia();
                    break;
                case 'capacidad':
                    $strategy = new BusquedaPorCapacidad();
                    break;
                case 'disponibilidad':
                    $strategy = new BusquedaPorDisponibilidad();
                    break;
                default:
                    throw new \Exception('Estrategia no válida');
            }
            
            $this->localidadService = new LocalidadService($strategy);
            $localidades = $this->localidadService->buscarLocalidadesDisponibles($solicitudTemp);
            
            $this->jsonResponse([
                'localidades' => $localidades,
                'estrategia_usada' => $data['estrategia'],
                'cantidad_solicitada' => $data['cantidad_litros'],
                'total_encontradas' => count($localidades)
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
    
    // PUT /api/localidades/{id}/disponibilidad
    public function actualizarDisponibilidad($id) {
        try {
            $data = $this->getJsonInput();
            $this->validateRequired($data, ['nueva_cantidad']);
            
            $resultado = $this->repository->actualizarDisponibilidad($id, $data['nueva_cantidad']);
            
            if ($resultado) {
                $this->jsonResponse([
                    'mensaje' => 'Disponibilidad actualizada',
                    'localidad_id' => $id,
                    'nueva_cantidad' => $data['nueva_cantidad']
                ]);
            } else {
                $this->jsonResponse('Error al actualizar disponibilidad', 500);
            }
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 400);
        }
    }
}
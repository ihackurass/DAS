<?php
namespace Services;

use Core\Strategy\BusquedaLocalidadInterface;
use Database\LocalidadRepository;

class LocalidadService {
    private $strategy;
    private $repository;
    
    public function __construct(BusquedaLocalidadInterface $strategy = null) {
        $this->repository = new LocalidadRepository();
        $this->strategy = $strategy;
    }
    
    public function setStrategy(BusquedaLocalidadInterface $strategy) {
        $this->strategy = $strategy;
    }
    
    public function buscarLocalidadesDisponibles($solicitud) {
        if (!$this->strategy) {
            throw new \Exception("Estrategia de búsqueda no definida");
        }
        
        $localidades = $this->repository->obtenerActivas();
        return $this->strategy->buscar($solicitud, $localidades);
    }
}
<?php
namespace Core\Factory;

use Core\State\EstadoSolicitudInterface;
use Core\State\EstadoPendiente;

abstract class Solicitud {
    protected $id;
    protected $usuarioId;
    protected $cantidadLitros;
    protected $tipo;
    protected $estadoActual; // Objeto Estado en lugar de string
    protected $descripcion;
    protected $fechaSolicitud;
    protected $fechaLimite;
    
    abstract public function validar();
    abstract public function getPrioridad();
    abstract public function calcularFechaLimite();
    
    public function __construct($usuarioId, $cantidadLitros, $descripcion = '') {
        $this->usuarioId = $usuarioId;
        $this->cantidadLitros = $cantidadLitros;
        $this->descripcion = $descripcion;
        $this->fechaSolicitud = date('Y-m-d H:i:s');
        $this->fechaLimite = $this->calcularFechaLimite();
        
        // Estado inicial siempre es Pendiente
        $this->estadoActual = new EstadoPendiente();
    }
    
    // MÉTODOS DE ESTADO - delegan al objeto estado actual
    public function asignar() {
        return $this->estadoActual->asignar($this);
    }
    
    public function procesar() {
        return $this->estadoActual->procesar($this);
    }
    
    public function completar() {
        return $this->estadoActual->completar($this);
    }
    
    public function cancelar() {
        return $this->estadoActual->cancelar($this);
    }
    
    // GETTERS EXISTENTES
    public function getTipo() { return $this->tipo; }
    public function getEstado() { return $this->estadoActual->getNombre(); } // Cambio: obtiene nombre del estado
    public function getCantidadLitros() { return $this->cantidadLitros; }
    public function getFechaLimite() { return $this->fechaLimite; }
    public function getUsuarioId() { return $this->usuarioId; }
    public function getDescripcion() { return $this->descripcion; }
    public function getFechaSolicitud() { return $this->fechaSolicitud; }
    public function getId() { return $this->id; }
    
    // SETTERS
    public function setId($id) { $this->id = $id; }
    
    // NUEVO: Setter para cambiar estado (usado por los objetos Estado)
    public function setEstado(EstadoSolicitudInterface $nuevoEstado) {
        $this->estadoActual = $nuevoEstado;
    }
    
    // NUEVO: Obtener objeto estado actual (por si se necesita)
    public function getEstadoActual() {
        return $this->estadoActual;
    }
}
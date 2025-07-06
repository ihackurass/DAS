<?php
// api/routes.php
use Controllers\UsuarioController;
use Controllers\SolicitudController;
use Controllers\LocalidadController;
use Controllers\ReporteController;

function registerRoutes($router) {
    // ========================
    // RUTAS DE AUTENTICACIÓN
    // ========================
    $router->post('/usuarios/login', [UsuarioController::class, 'login']);
    $router->post('/usuarios/registro', [UsuarioController::class, 'registro']);
    $router->get('/usuarios/perfil/{id}', [UsuarioController::class, 'perfil']);
    $router->get('/usuarios/asesores', [UsuarioController::class, 'obtenerAsesores']);
    $router->get('/usuarios/encargados', [UsuarioController::class, 'obtenerEncargados']);
    
    // ========================
    // RUTAS DE SOLICITUDES
    // ========================
    $router->post('/solicitudes', [SolicitudController::class, 'crear']);
    $router->get('/solicitudes', [SolicitudController::class, 'listar']);
    $router->get('/solicitudes/{id}', [SolicitudController::class, 'obtener']);
    $router->put('/solicitudes/{id}/asignar', [SolicitudController::class, 'asignar']);
    $router->put('/solicitudes/{id}/estado', [SolicitudController::class, 'cambiarEstado']);
    
    // ========================
    // RUTAS DE LOCALIDADES
    // ========================
    $router->get('/localidades', [LocalidadController::class, 'listar']);
    $router->get('/localidades/{id}', [LocalidadController::class, 'obtener']);
    $router->post('/localidades/buscar', [LocalidadController::class, 'buscarDisponibles']);
    $router->put('/localidades/{id}/disponibilidad', [LocalidadController::class, 'actualizarDisponibilidad']);
    
    // ========================
    // RUTAS DE REPORTES
    // ========================
    $router->post('/reportes', [ReporteController::class, 'generar']);
    $router->get('/reportes/{id}', [ReporteController::class, 'obtener']);
    $router->get('/reportes/localidad/{localidadId}', [ReporteController::class, 'obtenerPorLocalidad']);
    $router->delete('/reportes/{id}', [ReporteController::class, 'eliminar']);
    $router->get('/reportes/comandos/historial', [ReporteController::class, 'historialComandos']);
    $router->post('/reportes/comandos/deshacer', [ReporteController::class, 'deshacerComando']);
    
    // ========================
    // RUTA DE SALUD
    // ========================
    $router->get('/health', function() {
        echo json_encode([
            'status' => 'OK',
            'message' => 'API funcionando correctamente',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ]);
    });
}
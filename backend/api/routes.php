<?php
// api/routes.php
use Controllers\UsuarioController;
use Controllers\SolicitudController;
use Controllers\LocalidadController;
use Controllers\ReporteController;
use Controllers\TicketController; // ← NUEVO IMPORT
use Controllers\EstadisticasController; // ← NUEVO IMPORT

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
    $router->get('/solicitudes/{id}/asignacion', [SolicitudController::class, 'obtenerAsignacion']);
    $router->get('/solicitudes/{id}/ticket', [TicketController::class, 'obtenerTicketDeSolicitud']); // ← NUEVA RUTA
    $router->put('/solicitudes/{id}/asignar', [SolicitudController::class, 'asignar']);
    $router->put('/solicitudes/{id}/estado', [SolicitudController::class, 'cambiarEstado']);
    
    // ========================
    // RUTAS DE ESTADÍSTICAS ← NUEVA SECCIÓN
    // ========================
    $router->get('/estadisticas/dashboard', [EstadisticasController::class, 'dashboard']);
    $router->get('/estadisticas/encargado/{id}', [EstadisticasController::class, 'encargado']);
    $router->get('/estadisticas/asesor/{id}', [EstadisticasController::class, 'asesor']);
    $router->get('/estadisticas/cliente/{id}', [EstadisticasController::class, 'cliente']);

    // ========================
    // RUTAS DE TICKETS ← NUEVA SECCIÓN
    // ========================
    $router->get('/tickets/todos', [TicketController::class, 'obtenerTodos']);
    $router->get('/tickets/{codigo}', [TicketController::class, 'buscarPorCodigo']);
    $router->put('/tickets/{id}/llegada', [TicketController::class, 'registrarLlegada']);
    $router->put('/tickets/{id}/entrega', [TicketController::class, 'registrarEntrega']);
    $router->get('/tickets/localidad/{localidad_id}', [TicketController::class, 'obtenerPorLocalidad']);
    $router->get('/tickets/encargado/{encargado_id}', [TicketController::class, 'obtenerPorEncargado']);
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
    $router->get('/reportes/localidad/{localidadId}', [ReporteController::class, 'obtenerPorLocalidad']);
    $router->delete('/reportes/{id}', [ReporteController::class, 'eliminar']);
    $router->get('/reportes/comandos/historial', [ReporteController::class, 'historialComandos']);
    $router->post('/reportes/comandos/deshacer', [ReporteController::class, 'deshacerComando']);
    
    // ← NUEVAS RUTAS DE REPORTES RÁPIDOS
    $router->get('/reportes/resumen/diario', [ReporteController::class, 'resumenDiario']);
    $router->get('/reportes/resumen/semanal', [ReporteController::class, 'resumenSemanal']);
    $router->get('/reportes/resumen/mensual', [ReporteController::class, 'resumenMensual']);
    $router->get('/reportes/resumen-general', [ReporteController::class, 'resumenGeneral']);
    $router->get('/reportes/{id}', [ReporteController::class, 'obtener']);

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
<?php
namespace Controllers;

use Database\SolicitudRepository;
use Database\TicketRepository;
use Database\LocalidadRepository;
use Database\UsuarioRepository;

class EstadisticasController extends BaseController {
    private $solicitudRepository;
    private $ticketRepository;
    private $localidadRepository;
    private $usuarioRepository;
    
    public function __construct() {
        $this->solicitudRepository = new SolicitudRepository();
        $this->ticketRepository = new TicketRepository();
        $this->localidadRepository = new LocalidadRepository();
        $this->usuarioRepository = new UsuarioRepository();
    }
    
    // GET /api/estadisticas/dashboard - Estadísticas generales
    public function dashboard() {
        try {
            $db = \Config\Database::getInstance()->getConnection();
            
            // Estadísticas de solicitudes
            $stmt = $db->prepare("
                SELECT 
                    estado,
                    COUNT(*) as cantidad,
                    SUM(cantidad_litros) as total_litros
                FROM solicitudes 
                GROUP BY estado
            ");
            $stmt->execute();
            $solicitudesPorEstado = $stmt->fetchAll();
            
            // Estadísticas de tickets
            $stmt = $db->prepare("
                SELECT 
                    estado_entrega,
                    COUNT(*) as cantidad
                FROM tickets 
                GROUP BY estado_entrega
            ");
            $stmt->execute();
            $ticketsPorEstado = $stmt->fetchAll();
            
            // Estadísticas de localidades
            $stmt = $db->prepare("
                SELECT 
                    COUNT(*) as total_localidades,
                    AVG(disponibilidad) as promedio_disponibilidad,
                    SUM(disponibilidad) as disponibilidad_total,
                    SUM(capacidad_maxima) as capacidad_total
                FROM localidades 
                WHERE activo = 1
            ");
            $stmt->execute();
            $localidades = $stmt->fetch();
            
            // Usuarios por rol
            $stmt = $db->prepare("
                SELECT 
                    rol,
                    COUNT(*) as cantidad
                FROM usuarios 
                GROUP BY rol
            ");
            $stmt->execute();
            $usuariosPorRol = $stmt->fetchAll();
            
            // Actividad reciente (últimas 24 horas)
            $stmt = $db->prepare("
                SELECT 
                    COUNT(*) as solicitudes_hoy
                FROM solicitudes 
                WHERE DATE(fecha_solicitud) = CURDATE()
            ");
            $stmt->execute();
            $actividadHoy = $stmt->fetch();
            
            $stmt = $db->prepare("
                SELECT 
                    COUNT(*) as entregas_hoy
                FROM tickets 
                WHERE DATE(fecha_llegada) = CURDATE() 
                AND estado_entrega = 'entregado'
            ");
            $stmt->execute();
            $entregasHoy = $stmt->fetch();
            
            // Top localidades más demandadas
            $stmt = $db->prepare("
                SELECT 
                    l.nombre,
                    l.direccion,
                    COUNT(a.id) as total_asignaciones,
                    SUM(s.cantidad_litros) as litros_totales
                FROM localidades l
                LEFT JOIN asignaciones a ON l.id = a.localidad_id
                LEFT JOIN solicitudes s ON a.solicitud_id = s.id
                WHERE l.activo = 1
                GROUP BY l.id, l.nombre, l.direccion
                ORDER BY total_asignaciones DESC
                LIMIT 5
            ");
            $stmt->execute();
            $topLocalidades = $stmt->fetchAll();
            
            $this->jsonResponse([
                'solicitudes_por_estado' => $solicitudesPorEstado,
                'tickets_por_estado' => $ticketsPorEstado,
                'localidades' => $localidades,
                'usuarios_por_rol' => $usuariosPorRol,
                'actividad_hoy' => [
                    'solicitudes' => $actividadHoy['solicitudes_hoy'],
                    'entregas' => $entregasHoy['entregas_hoy']
                ],
                'top_localidades' => $topLocalidades,
                'fecha_consulta' => date('Y-m-d H:i:s')
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/estadisticas/encargado/{id} - Estadísticas específicas del encargado
    public function encargado($encargadoId) {
        try {
            $fecha = $_GET['fecha'] ?? date('Y-m-d');
            
            $db = \Config\Database::getInstance()->getConnection();
            
            // Tickets del encargado por fecha
            $stmt = $db->prepare("
                SELECT 
                    t.estado_entrega,
                    COUNT(*) as cantidad,
                    SUM(CASE WHEN t.estado_entrega = 'entregado' THEN t.cantidad_entregada ELSE 0 END) as litros_entregados
                FROM tickets t
                JOIN solicitudes s ON t.solicitud_id = s.id
                JOIN asignaciones a ON s.id = a.solicitud_id
                JOIN localidades l ON a.localidad_id = l.id
                WHERE l.encargado_id = ? 
                AND DATE(COALESCE(t.fecha_llegada, s.fecha_solicitud)) = ?
                GROUP BY t.estado_entrega
            ");
            $stmt->execute([$encargadoId, $fecha]);
            $ticketsDelDia = $stmt->fetchAll();
            
            // Localidades del encargado
            $stmt = $db->prepare("
                SELECT 
                    id,
                    nombre,
                    direccion,
                    disponibilidad,
                    capacidad_maxima
                FROM localidades 
                WHERE encargado_id = ? AND activo = 1
            ");
            $stmt->execute([$encargadoId]);
            $localidades = $stmt->fetchAll();
            
            // Resumen de la semana
            $stmt = $db->prepare("
                SELECT 
                    DATE(COALESCE(t.fecha_llegada, s.fecha_solicitud)) as fecha,
                    COUNT(*) as total_tickets,
                    SUM(CASE WHEN t.estado_entrega = 'entregado' THEN 1 ELSE 0 END) as entregados,
                    SUM(CASE WHEN t.estado_entrega = 'entregado' THEN t.cantidad_entregada ELSE 0 END) as litros_entregados
                FROM tickets t
                JOIN solicitudes s ON t.solicitud_id = s.id
                JOIN asignaciones a ON s.id = a.solicitud_id
                JOIN localidades l ON a.localidad_id = l.id
                WHERE l.encargado_id = ? 
                AND DATE(COALESCE(t.fecha_llegada, s.fecha_solicitud)) >= DATE_SUB(?, INTERVAL 7 DAY)
                GROUP BY DATE(COALESCE(t.fecha_llegada, s.fecha_solicitud))
                ORDER BY fecha DESC
            ");
            $stmt->execute([$encargadoId, $fecha]);
            $semanaCompleta = $stmt->fetchAll();
            
            $this->jsonResponse([
                'encargado_id' => $encargadoId,
                'fecha' => $fecha,
                'tickets_del_dia' => $ticketsDelDia,
                'localidades' => $localidades,
                'resumen_semana' => $semanaCompleta
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/estadisticas/asesor/{id} - Estadísticas del asesor
    public function asesor($asesorId) {
        try {
            $db = \Config\Database::getInstance()->getConnection();
            
            // Asignaciones del asesor
            $stmt = $db->prepare("
                SELECT 
                    s.estado,
                    COUNT(*) as cantidad,
                    SUM(s.cantidad_litros) as litros_totales
                FROM asignaciones a
                JOIN solicitudes s ON a.solicitud_id = s.id
                WHERE a.asesor_id = ?
                GROUP BY s.estado
            ");
            $stmt->execute([$asesorId]);
            $asignacionesPorEstado = $stmt->fetchAll();
            
            // Eficiencia del asesor (% de solicitudes completadas)
            $stmt = $db->prepare("
                SELECT 
                    COUNT(*) as total_asignaciones,
                    SUM(CASE WHEN s.estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                    ROUND(
                        SUM(CASE WHEN s.estado = 'completada' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
                        1
                    ) as eficiencia_porcentaje
                FROM asignaciones a
                JOIN solicitudes s ON a.solicitud_id = s.id
                WHERE a.asesor_id = ?
            ");
            $stmt->execute([$asesorId]);
            $eficiencia = $stmt->fetch();
            
            // Localidades más asignadas por el asesor
            $stmt = $db->prepare("
                SELECT 
                    l.nombre,
                    l.direccion,
                    COUNT(*) as veces_asignada
                FROM asignaciones a
                JOIN localidades l ON a.localidad_id = l.id
                WHERE a.asesor_id = ?
                GROUP BY l.id, l.nombre, l.direccion
                ORDER BY veces_asignada DESC
                LIMIT 5
            ");
            $stmt->execute([$asesorId]);
            $localidadesFavoritas = $stmt->fetchAll();
            
            $this->jsonResponse([
                'asesor_id' => $asesorId,
                'asignaciones_por_estado' => $asignacionesPorEstado,
                'eficiencia' => $eficiencia,
                'localidades_favoritas' => $localidadesFavoritas
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
    
    // GET /api/estadisticas/cliente/{id} - Estadísticas del cliente
    public function cliente($clienteId) {
        try {
            $db = \Config\Database::getInstance()->getConnection();
            
            // Historial del cliente
            $stmt = $db->prepare("
                SELECT 
                    estado,
                    tipo_solicitud,
                    COUNT(*) as cantidad,
                    SUM(cantidad_litros) as litros_totales,
                    AVG(cantidad_litros) as promedio_litros
                FROM solicitudes 
                WHERE usuario_id = ?
                GROUP BY estado, tipo_solicitud
            ");
            $stmt->execute([$clienteId]);
            $historial = $stmt->fetchAll();
            
            // Consumo mensual
            $stmt = $db->prepare("
                SELECT 
                    YEAR(fecha_solicitud) as año,
                    MONTH(fecha_solicitud) as mes,
                    COUNT(*) as solicitudes,
                    SUM(cantidad_litros) as litros_totales
                FROM solicitudes 
                WHERE usuario_id = ?
                AND fecha_solicitud >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY YEAR(fecha_solicitud), MONTH(fecha_solicitud)
                ORDER BY año DESC, mes DESC
            ");
            $stmt->execute([$clienteId]);
            $consumoMensual = $stmt->fetchAll();
            
            $this->jsonResponse([
                'cliente_id' => $clienteId,
                'historial_por_estado' => $historial,
                'consumo_mensual' => $consumoMensual
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse($e->getMessage(), 500);
        }
    }
}
<?php
// api/Router.php
class Router {
    private $routes = [];
    private $middleware = [];
    
    public function get($path, $handler) {
        $this->addRoute('GET', $path, $handler);
    }
    
    public function post($path, $handler) {
        $this->addRoute('POST', $path, $handler);
    }
    
    public function put($path, $handler) {
        $this->addRoute('PUT', $path, $handler);
    }
    
    public function delete($path, $handler) {
        $this->addRoute('DELETE', $path, $handler);
    }
    
    private function addRoute($method, $path, $handler) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }
    
    public function resolve() {
        $requestMethod = $_SERVER['REQUEST_METHOD'];
        $requestPath = $this->getPath();
        
        foreach ($this->routes as $route) {
            if ($this->matchRoute($route, $requestMethod, $requestPath)) {
                return $this->executeHandler($route['handler'], $requestPath);
            }
        }
        
        $this->notFound();
    }
    
    private function getPath() {
        $uri = $_SERVER['REQUEST_URI'];
        $path = parse_url($uri, PHP_URL_PATH);
        
        // Quitar /api del inicio
        if (strpos($path, '/api') === 0) {
            $path = substr($path, 4); // Quita "/api"
        }
        
        // Si queda vacío o solo /, devolver /
        if (empty($path) || $path === '/') {
            return '/';
        }
        
        return $path;
    }
    
    private function matchRoute($route, $method, $path) {
        if ($route['method'] !== $method) {
            return false;
        }
        
        $routePath = $route['path'];
        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $routePath);
        $pattern = str_replace('/', '\/', $pattern);
        
        return preg_match('/^' . $pattern . '$/', $path);
    }
    
    private function executeHandler($handler, $path) {
        if (is_callable($handler)) {
            return call_user_func($handler);
        }
        
        if (is_array($handler)) {
            [$controller, $method] = $handler;
            $controllerInstance = new $controller();
            
            // Extraer parámetros de la URL
            $params = $this->extractParams($path);
            
            if (!empty($params)) {
                return call_user_func_array([$controllerInstance, $method], $params);
            } else {
                return call_user_func([$controllerInstance, $method]);
            }
        }
    }
    
    private function extractParams($path) {
        $segments = array_filter(explode('/', $path));
        return array_slice(array_values($segments), 1); // Omitir el primer segmento
    }
    
    private function notFound() {
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found',
            'path' => $this->getPath()
        ]);
    }
}
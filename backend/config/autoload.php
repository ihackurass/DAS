<?php
spl_autoload_register(function ($className) {
    // Para clases en src/
    $srcFile = __DIR__ . '/../src/' . str_replace('\\', '/', $className) . '.php';
    if (file_exists($srcFile)) {
        require_once $srcFile;
        return;
    }
    
    // Para clases en config/ (como Config\Database)
    if (strpos($className, 'Config\\') === 0) {
        $configFile = __DIR__ . '/' . str_replace('Config\\', '', $className) . '.php';
        if (file_exists($configFile)) {
            require_once $configFile;
            return;
        }
    }
});
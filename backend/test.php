<?php
require_once 'config/autoload.php';

use Config\Database;

$db = Database::getInstance()->getConnection();

$sql = "SELECT email, password FROM usuarios WHERE email = 'cliente@test.com'";
$stmt = $db->prepare($sql);
$stmt->execute();
$usuario = $stmt->fetch();

if ($usuario) {
    echo "Email: " . $usuario['email'] . "\n";
    echo "Hash almacenado: " . $usuario['password'] . "\n\n";
    
    $passwords_to_test = ['123456', 'test', 'password', ''];
    
    foreach ($passwords_to_test as $test_password) {
        if (password_verify($test_password, $usuario['password'])) {
            echo "✅ Password correcto: '$test_password'\n";
        } else {
            echo "❌ Password incorrecto: '$test_password'\n";
        }
    }
} else {
    echo "❌ Usuario no encontrado\n";
}
?>
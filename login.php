<?php
error_reporting(0);
ini_set('display_errors', '0');
ob_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean(); http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$pass = trim($data['password'] ?? '');

if ($pass !== ADMIN_PASSWORD) {
    ob_clean(); http_response_code(401); echo json_encode(['success' => false]); exit;
}

ob_clean();
echo json_encode(['success' => true, 'token' => base64_encode(ADMIN_PASSWORD)]);

<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (($data['password'] ?? '') === ADMIN_PASSWORD) {
    $token = base64_encode(ADMIN_PASSWORD);
    echo json_encode(['success' => true, 'token' => $token]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Неверный пароль']);
}

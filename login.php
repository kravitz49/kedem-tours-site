<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$_cfg = __DIR__ . '/config.php';
if (file_exists($_cfg)) require_once $_cfg;
if (!defined('ADMIN_PASSWORD')) define('ADMIN_PASSWORD', 'kedem2024admin');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);
    if (!empty($d['password']) && $d['password'] === ADMIN_PASSWORD) {
        echo json_encode(['success' => true, 'token' => base64_encode(ADMIN_PASSWORD)]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Неверный пароль']);
    }
    exit;
}

http_response_code(405); echo json_encode(['error' => 'Method not allowed']);

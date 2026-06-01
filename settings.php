<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/config.php';
$FILE = __DIR__ . '/settings.json';

function loadSettings($f) {
    if (!file_exists($f)) return [];
    return json_decode(file_get_contents($f), true) ?: [];
}

// GET — публичный, без авторизации
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(loadSettings($FILE), JSON_UNESCAPED_UNICODE);
    exit;
}

// POST — сохранение (только admin)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if ($auth !== 'Bearer ' . base64_encode(ADMIN_PASSWORD)) {
        http_response_code(401); echo json_encode(['error'=>'Unauthorized']); exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $current = loadSettings($FILE);
    $merged  = array_merge($current, $data);
    file_put_contents($FILE, json_encode($merged, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405); echo json_encode(['error'=>'Method not allowed']);

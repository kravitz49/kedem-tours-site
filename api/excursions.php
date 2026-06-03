<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$FILE = __DIR__ . '/../excursions.json';

function loadExcursions($file) {
    if (!file_exists($file)) return [];
    return json_decode(file_get_contents($file), true) ?: [];
}
function saveExcursions($file, $data) {
    file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}
function checkAuth() {
    $cfg = __DIR__ . '/../config.php';
    if (file_exists($cfg)) require_once $cfg;
    $password = defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : 'kedem2024admin';
    $auth     = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $expected = 'Bearer ' . base64_encode($password);
    if ($auth !== $expected) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

// GET — список экскурсий (публичный)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(loadExcursions($FILE), JSON_UNESCAPED_UNICODE);
    exit;
}

// POST — добавить экскурсию
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    checkAuth();
    $data = json_decode(file_get_contents('php://input'), true);
    $excursions = loadExcursions($FILE);
    $ids = array_column($excursions, 'id');
    $data['id'] = $ids ? max($ids) + 1 : 1;
    $excursions[] = $data;
    saveExcursions($FILE, $excursions);
    echo json_encode(['success' => true, 'id' => $data['id']], JSON_UNESCAPED_UNICODE);
    exit;
}

// PUT — обновить экскурсию
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    checkAuth();
    $data = json_decode(file_get_contents('php://input'), true);
    $excursions = loadExcursions($FILE);
    foreach ($excursions as &$exc) {
        if ($exc['id'] == $data['id']) { $exc = $data; break; }
    }
    saveExcursions($FILE, $excursions);
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

// DELETE — удалить экскурсию
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    checkAuth();
    $parts      = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    $id         = (int)end($parts);
    $excursions = array_values(array_filter(loadExcursions($FILE), function($e) use ($id) { return $e['id'] != $id; }));
    saveExcursions($FILE, $excursions);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

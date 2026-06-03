<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$FILE = __DIR__ . '/orders.json';

$_cfg = __DIR__ . '/config.php';
if (file_exists($_cfg)) require_once $_cfg;
if (!defined('ADMIN_PASSWORD')) define('ADMIN_PASSWORD', 'kedem2024admin');

function loadOrders($f) {
    if (!file_exists($f)) return [];
    return json_decode(file_get_contents($f), true) ?: [];
}
function saveOrders($f, $data) {
    file_put_contents($f, json_encode(array_values($data), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}
function checkAuth() {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if ($auth !== 'Bearer ' . base64_encode(ADMIN_PASSWORD)) {
        http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit;
    }
}

// GET — список всех заявок (только admin)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    checkAuth();
    $orders = loadOrders($FILE);
    usort($orders, function($a, $b) { return strcmp($b['date'], $a['date']); });
    echo json_encode($orders, JSON_UNESCAPED_UNICODE);
    exit;
}

// DELETE — удалить заявку (только admin)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    checkAuth();
    $parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    $id     = (int)end($parts);
    $orders = array_values(array_filter(loadOrders($FILE), function($o) use ($id) {
        return $o['id'] != $id;
    }));
    saveOrders($FILE, $orders);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405); echo json_encode(['error' => 'Method not allowed']);

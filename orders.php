<?php
error_reporting(0);
ini_set('display_errors', '0');
ob_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { ob_clean(); http_response_code(204); exit; }

require_once __DIR__ . '/config.php';

// Auth
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if ($auth !== 'Bearer ' . base64_encode(ADMIN_PASSWORD)) {
    ob_clean(); http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit;
}

try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (Exception $e) {
    ob_clean(); http_response_code(500); echo json_encode(['error' => 'DB connection failed']); exit;
}

// Extract order ID from URL path: /orders.php/123
$path = $_SERVER['PATH_INFO'] ?? '';
$orderId = (int) trim($path, '/');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!$orderId) { ob_clean(); http_response_code(400); echo json_encode(['error' => 'Missing id']); exit; }
    $pdo->prepare("DELETE FROM orders WHERE id = ?")->execute([$orderId]);
    ob_clean(); echo json_encode(['success' => true]); exit;
}

// GET — return all orders
$rows = $pdo->query("SELECT id, created_at, excursion, first_name, last_name, phone, seats, pickup FROM orders ORDER BY id DESC")->fetchAll();

$orders = array_map(function($r) {
    return [
        'id'        => (int) $r['id'],
        'date'      => $r['created_at'],
        'excursion' => $r['excursion'],
        'firstName' => $r['first_name'],
        'lastName'  => $r['last_name'],
        'phone'     => $r['phone'],
        'seats'     => (int) $r['seats'],
        'pickup'    => $r['pickup'],
    ];
}, $rows);

ob_clean();
echo json_encode($orders);

<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../../config.php';

// Проверка токена
$auth     = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$expected = 'Bearer ' . base64_encode(ADMIN_PASSWORD);
if ($auth !== $expected) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
                   DB_USER, DB_PASS,
                   [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    // GET — список всех заказов
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $rows = $pdo->query("SELECT * FROM orders ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
        // Приводим к формату, ожидаемому фронтендом
        $result = array_map(function($r) {
            return [
                'id'        => (int)$r['id'],
                'date'      => $r['created_at'],
                'excursion' => $r['excursion'],
                'firstName' => $r['first_name'],
                'lastName'  => $r['last_name'],
                'phone'     => $r['phone'],
                'seats'     => (int)$r['seats'],
                'pickup'    => $r['pickup'],
            ];
        }, $rows);
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // DELETE — удалить заказ по ID
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $parts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
        $id    = (int)end($parts);
        $stmt  = $pdo->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

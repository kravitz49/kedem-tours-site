<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$fields = ['excursion','firstName','lastName','phone','seats','pickup'];
foreach ($fields as $f) {
    if (empty($data[$f])) {
        http_response_code(400);
        echo json_encode(['error' => 'Заполните все поля']);
        exit;
    }
}

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
                   DB_USER, DB_PASS,
                   [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $stmt = $pdo->prepare("INSERT INTO orders
        (excursion, first_name, last_name, phone, seats, pickup)
        VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        trim($data['excursion']),
        trim($data['firstName']),
        trim($data['lastName']),
        trim($data['phone']),
        (int)$data['seats'],
        trim($data['pickup']),
    ]);
    $orderId = $pdo->lastInsertId();

    // Отправка email
    $to      = NOTIFY_EMAIL;
    $subject = '=?UTF-8?B?' . base64_encode('Новый заказ — ' . $data['excursion']) . '?=';
    $body    = "Новый заказ на экскурсию\n\n"
             . "Экскурсия:     {$data['excursion']}\n"
             . "Имя:           {$data['firstName']} {$data['lastName']}\n"
             . "Телефон:       {$data['phone']}\n"
             . "Мест:          {$data['seats']}\n"
             . "Место посадки: {$data['pickup']}\n"
             . "Дата заказа:   " . date('d.m.Y H:i') . "\n";
    $headers = "From: noreply@kedem-tours.com\r\n"
             . "Content-Type: text/plain; charset=UTF-8\r\n";
    @mail($to, $subject, $body, $headers);

    echo json_encode(['success' => true, 'orderId' => (int)$orderId]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сервера: ' . $e->getMessage()]);
}

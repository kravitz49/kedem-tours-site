<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
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

function sendOrderEmail($o) {
    if (!defined('SMTP_PASS') || SMTP_PASS === '') return;

    $name    = htmlspecialchars($o['firstName'] . ' ' . $o['lastName']);
    $subject = 'Новая заявка — ' . $o['firstName'] . ' ' . $o['lastName'];

    $passengers = '';
    if (!empty($o['passengers'])) {
        $rows = '';
        foreach ($o['passengers'] as $i => $p) {
            $rows .= '<tr><td style="padding:6px 12px;background:#f8f9fa">Пассажир ' . ($i+1) . '</td>'
                   . '<td style="padding:6px 12px">' . htmlspecialchars($p['name'] ?? '—') . ' — '
                   . htmlspecialchars($p['pickup'] ?? '—') . '</td></tr>';
        }
        $passengers = '<tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold;vertical-align:top">Пассажиры</td>'
                    . '<td style="padding:10px 16px"><table style="width:100%;border-collapse:collapse">' . $rows . '</table></td></tr>';
    }

    $counts = '';
    if (isset($o['adultsCount'])) {
        $parts = [];
        if ($o['adultsCount']  > 0) $parts[] = 'Взрослых: ' . $o['adultsCount'];
        if ($o['childrenCount'] > 0) $parts[] = 'Детей: '   . $o['childrenCount'];
        if ($o['seniorsCount']  > 0) $parts[] = 'Пенсионеров: ' . $o['seniorsCount'];
        if (empty($parts))           $parts[] = 'Мест: ' . $o['seats'];
        $counts = implode(' / ', $parts);
    } else {
        $counts = 'Мест: ' . ($o['seats'] ?? 1);
    }

    $html = '
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <div style="background:linear-gradient(135deg,#0f3460,#1a1a2e);padding:20px 28px;border-radius:12px 12px 0 0">
        <h2 style="color:#c9a84c;margin:0">📋 Новая заявка на экскурсию</h2>
        <p style="color:#fff;margin:6px 0 0;font-size:.9rem">KEDEM TOURS</p>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e0e0e0;border-top:none">
        <tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold;width:35%">Экскурсия</td>
            <td style="padding:10px 16px"><b>' . htmlspecialchars($o['excursion'] ?? '') . '</b></td></tr>
        <tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Имя</td>
            <td style="padding:10px 16px">' . $name . '</td></tr>
        <tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Телефон</td>
            <td style="padding:10px 16px">' . htmlspecialchars($o['phone'] ?? '') . '</td></tr>'
        . (!empty($o['email']) ? '<tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Email</td>
            <td style="padding:10px 16px">' . htmlspecialchars($o['email']) . '</td></tr>' : '')
        . '<tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Участники</td>
            <td style="padding:10px 16px">' . $counts . '</td></tr>
        <tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Место посадки</td>
            <td style="padding:10px 16px">' . htmlspecialchars($o['pickup'] ?? '') . '</td></tr>'
        . $passengers
        . (!empty($o['specialNeeds']) ? '<tr><td style="padding:10px 16px;background:#fff3cd;font-weight:bold">Особые потребности</td>
            <td style="padding:10px 16px;background:#fff3cd">' . nl2br(htmlspecialchars($o['specialNeeds'])) . '</td></tr>' : '')
        . '<tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Дата</td>
            <td style="padding:10px 16px">' . date('d.m.Y H:i') . '</td></tr>
      </table>
      <div style="background:#d4edda;padding:14px 16px;border-radius:0 0 12px 12px;font-size:.85rem;color:#155724">
        ✅ Войдите в кабинет для просмотра всех заявок.
      </div>
    </div>';

    $host = 'ssl://smtp.gmail.com'; $port = 465;
    $sock = @fsockopen($host, $port, $errno, $errstr, 15);
    if (!$sock) return;
    $read = function() use ($sock) { return fgets($sock, 512); };
    $send = function($c) use ($sock) { fwrite($sock, $c . "\r\n"); };
    $read();
    $send('EHLO kedem-tours.com');
    while (($l = $read()) !== false && substr($l,3,1) === '-') {}
    $send('AUTH LOGIN'); $read();
    $send(base64_encode(SMTP_USER)); $read();
    $send(base64_encode(SMTP_PASS)); $r2 = $read();
    if (strpos($r2,'235') === false) { fclose($sock); return; }
    $send('MAIL FROM:<'.SMTP_USER.'>'); $read();
    $send('RCPT TO:<'.NOTIFY_EMAIL.'>'); $read();
    $send('DATA'); $read();
    $encSubj = '=?UTF-8?B?'.base64_encode($subject).'?=';
    $msg  = "From: Kedem Tours <".SMTP_USER.">\r\nTo: ".NOTIFY_EMAIL."\r\nSubject: $encSubj\r\n";
    $msg .= "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
    $msg .= chunk_split(base64_encode($html))."\r\n.\r\n";
    $send($msg); $read(); $send('QUIT'); fclose($sock);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit;
}

$d = json_decode(file_get_contents('php://input'), true);

// Валидация обязательных полей
if (empty($d['firstName']) || empty($d['lastName']) || empty($d['phone'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Заполните все обязательные поля']); exit;
}
$seats = (int)($d['seats'] ?? 0);
if ($seats < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Укажите количество участников']); exit;
}
$hasPassengers = !empty($d['passengers']) && is_array($d['passengers']) && count($d['passengers']) > 0;
if (empty($d['pickup']) && !$hasPassengers) {
    http_response_code(400);
    echo json_encode(['error' => 'Укажите место посадки']); exit;
}

$order = [
    'id'            => (int)(microtime(true) * 1000),
    'date'          => date('Y-m-d H:i:s'),
    'excursion'     => trim($d['excursion']     ?? ''),
    'firstName'     => trim($d['firstName']),
    'lastName'      => trim($d['lastName']),
    'phone'         => trim($d['phone']),
    'email'         => trim($d['email']         ?? ''),
    'adultsCount'   => (int)($d['adultsCount']  ?? 0),
    'childrenCount' => (int)($d['childrenCount']?? 0),
    'seniorsCount'  => (int)($d['seniorsCount'] ?? 0),
    'seats'         => $seats,
    'pickup'        => trim($d['pickup']        ?? ''),
    'passengers'    => $d['passengers']         ?? [],
    'specialNeeds'  => trim($d['specialNeeds']  ?? ''),
];

$orders   = loadOrders($FILE);
$orders[] = $order;
saveOrders($FILE, $orders);
sendOrderEmail($order);

echo json_encode(['success' => true]);

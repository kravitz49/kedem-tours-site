<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$FILE = __DIR__ . '/reviews.json';

// Загружаем config.php только если существует (нужен для авторизации)
$_cfg = __DIR__ . '/config.php';
if (file_exists($_cfg)) require_once $_cfg;
if (!defined('ADMIN_PASSWORD')) define('ADMIN_PASSWORD', 'kedem2024admin');

function loadReviews($f) {
    if (!file_exists($f)) return [];
    return json_decode(file_get_contents($f), true) ?: [];
}
function saveReviews($f, $data) {
    file_put_contents($f, json_encode(array_values($data), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}
function checkAuth() {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if ($auth !== 'Bearer ' . base64_encode(ADMIN_PASSWORD)) {
        http_response_code(401); echo json_encode(['error'=>'Unauthorized']); exit;
    }
}
function sendReviewEmail($r) {
    if (!defined('SMTP_PASS') || SMTP_PASS === '') return;
    $subject = 'Новый отзыв — ' . $r['name'];
    $html = '
    <div style="font-family:Arial,sans-serif;max-width:560px">
      <div style="background:linear-gradient(135deg,#0f3460,#1a1a2e);padding:20px 28px;border-radius:12px 12px 0 0">
        <h2 style="color:#c9a84c;margin:0">&#11088; Новый отзыв на сайте</h2>
        <p style="color:#fff;margin:6px 0 0;font-size:.9rem">KEDEM TOURS — требует модерации</p>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e0e0e0;border-top:none">
        <tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold;width:35%">Имя</td>
            <td style="padding:10px 16px">' . htmlspecialchars($r['name']) . '</td></tr>
        <tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Оценка</td>
            <td style="padding:10px 16px">' . str_repeat('⭐', (int)$r['rating']) . '</td></tr>
        <tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Экскурсия</td>
            <td style="padding:10px 16px">' . htmlspecialchars($r['excursion'] ?? '—') . '</td></tr>
        <tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Отзыв</td>
            <td style="padding:10px 16px">' . nl2br(htmlspecialchars($r['text'])) . '</td></tr>
        <tr><td style="padding:10px 16px;background:#f8f9fa;font-weight:bold">Дата</td>
            <td style="padding:10px 16px">' . date('d.m.Y H:i') . '</td></tr>
      </table>
      <div style="background:#fff3cd;padding:14px 16px;border-radius:0 0 12px 12px;font-size:.85rem;color:#856404">
        &#9888; Отзыв ожидает модерации. Войдите в кабинет чтобы опубликовать или удалить его.
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
    $boundary = md5(uniqid());
    $encSubj = '=?UTF-8?B?'.base64_encode($subject).'?=';
    $msg  = "From: Kedem Tours <".SMTP_USER.">\r\nTo: ".NOTIFY_EMAIL."\r\nSubject: $encSubj\r\n";
    $msg .= "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
    $msg .= chunk_split(base64_encode($html))."\r\n.\r\n";
    $send($msg); $read(); $send('QUIT'); fclose($sock);
}

// GET — публичные (опубликованные) или все (admin)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $isAdmin = ($auth === 'Bearer ' . base64_encode(ADMIN_PASSWORD));
    $reviews = loadReviews($FILE);
    if (!$isAdmin) {
        $reviews = array_values(array_filter($reviews, function($r){ return $r['status'] === 'published'; }));
    }
    usort($reviews, function($a,$b){ return strcmp($b['date'], $a['date']); });
    echo json_encode($reviews, JSON_UNESCAPED_UNICODE);
    exit;
}

// POST — новый отзыв (публичный, статус pending)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);
    if (empty($d['name']) || empty($d['text'])) {
        http_response_code(400); echo json_encode(['error'=>'Заполните имя и текст']); exit;
    }
    $review = [
        'id'        => time() * 1000 + rand(0,999),
        'date'      => date('Y-m-d H:i:s'),
        'name'      => trim($d['name']),
        'text'      => trim($d['text']),
        'rating'    => max(1, min(5, (int)($d['rating'] ?? 5))),
        'excursion' => trim($d['excursion'] ?? ''),
        'status'    => 'pending',
    ];
    $reviews = loadReviews($FILE);
    $reviews[] = $review;
    saveReviews($FILE, $reviews);
    sendReviewEmail($review);
    echo json_encode(['success'=>true]);
    exit;
}

// PUT — редактировать / изменить статус (admin)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    checkAuth();
    $d = json_decode(file_get_contents('php://input'), true);
    $reviews = loadReviews($FILE);
    foreach ($reviews as &$r) {
        if ($r['id'] == $d['id']) {
            if (isset($d['status']))    $r['status']    = $d['status'];
            if (isset($d['text']))      $r['text']      = $d['text'];
            if (isset($d['name']))      $r['name']      = $d['name'];
            if (isset($d['rating']))    $r['rating']    = (int)$d['rating'];
            if (isset($d['excursion'])) $r['excursion'] = $d['excursion'];
            break;
        }
    }
    saveReviews($FILE, $reviews);
    echo json_encode(['success'=>true]);
    exit;
}

// DELETE — удалить (admin)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    checkAuth();
    $parts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    $id    = (int)end($parts);
    $reviews = array_values(array_filter(loadReviews($FILE), function($r) use ($id){ return $r['id'] != $id; }));
    saveReviews($FILE, $reviews);
    echo json_encode(['success'=>true]);
    exit;
}

http_response_code(405); echo json_encode(['error'=>'Method not allowed']);

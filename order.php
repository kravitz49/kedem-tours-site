<?php
error_reporting(0);
ini_set('display_errors', '0');
ob_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data   = json_decode(file_get_contents('php://input'), true);
$fields = ['excursion','firstName','lastName','phone','seats','pickup'];
foreach ($fields as $f) {
    if (empty($data[$f])) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['error' => 'Заполните все поля']);
        exit;
    }
}

// ── Сохранение в БД ─────────────────────────────────────────────────────────
try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

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

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка БД: ' . $e->getMessage()]);
    exit;
}

// ── Отправка email через Gmail SMTP ─────────────────────────────────────────
if (SMTP_PASS !== '') {
    $subject  = 'Новый заказ — ' . $data['excursion'];
    $htmlBody = '
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#0f3460,#1a1a2e);padding:20px 28px;border-radius:12px 12px 0 0">
        <h2 style="color:#c9a84c;margin:0;font-size:1.3rem">&#128204; Новый заказ на экскурсию</h2>
        <p style="color:#fff;margin:6px 0 0;font-size:.9rem">Кедем Турс</p>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e0e0e0;border-top:none">
        <tr><td style="padding:12px 16px;background:#f8f9fa;font-weight:bold;width:40%;border-bottom:1px solid #e0e0e0">Экскурсия</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e0e0e0">' . htmlspecialchars($data['excursion']) . '</td></tr>
        <tr><td style="padding:12px 16px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #e0e0e0">Имя и фамилия</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e0e0e0">' . htmlspecialchars($data['firstName'].' '.$data['lastName']) . '</td></tr>
        <tr><td style="padding:12px 16px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #e0e0e0">Телефон</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e0e0e0">' . htmlspecialchars($data['phone']) . '</td></tr>
        <tr><td style="padding:12px 16px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #e0e0e0">Количество мест</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e0e0e0"><strong>' . (int)$data['seats'] . '</strong></td></tr>
        <tr><td style="padding:12px 16px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #e0e0e0">Место посадки</td>
            <td style="padding:12px 16px;border-bottom:1px solid #e0e0e0">&#128205; ' . htmlspecialchars($data['pickup']) . '</td></tr>
        <tr><td style="padding:12px 16px;background:#f8f9fa;font-weight:bold">Дата заказа</td>
            <td style="padding:12px 16px">' . date('d.m.Y H:i') . '</td></tr>
      </table>
      <div style="background:#f0f4ff;padding:14px 16px;border-radius:0 0 12px 12px;font-size:.8rem;color:#666">
        Заказ #' . $orderId . ' • Кедем Турс
      </div>
    </div>';

    smtp_send(SMTP_USER, SMTP_PASS, NOTIFY_EMAIL, $subject, $htmlBody);
}

ob_clean();
echo json_encode(['success' => true, 'orderId' => (int)$orderId]);


// ── Функция SMTP (Gmail SSL, без библиотек) ──────────────────────────────────
function smtp_send(string $user, string $pass, string $to, string $subject, string $html): void
{
    $host    = 'ssl://smtp.gmail.com';
    $port    = 465;
    $timeout = 15;

    $sock = @fsockopen($host, $port, $errno, $errstr, $timeout);
    if (!$sock) return; // тихо, не ломаем заказ

    $read = function() use ($sock) { return fgets($sock, 512); };
    $send = function(string $cmd) use ($sock) { fwrite($sock, $cmd . "\r\n"); };

    $read(); // приветствие
    $send('EHLO kedem-tours.com');
    while (($line = $read()) !== false && substr($line, 3, 1) === '-') {} // читаем все строки EHLO

    $send('AUTH LOGIN');
    $read();
    $send(base64_encode($user));
    $read();
    $send(base64_encode($pass));
    $r = $read();
    if (strpos($r, '235') === false) { fclose($sock); return; } // auth failed

    $send('MAIL FROM:<' . $user . '>');
    $read();
    $send('RCPT TO:<' . $to . '>');
    $read();
    $send('DATA');
    $read();

    $boundary = md5(uniqid());
    $encSubj  = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $msg  = "From: Kedem Tours <{$user}>\r\n";
    $msg .= "To: {$to}\r\n";
    $msg .= "Subject: {$encSubj}\r\n";
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
    $msg .= "\r\n";
    $msg .= "--{$boundary}\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n";
    $msg .= "Content-Transfer-Encoding: base64\r\n";
    $msg .= "\r\n";
    $msg .= chunk_split(base64_encode($html)) . "\r\n";
    $msg .= "--{$boundary}--\r\n";
    $msg .= "\r\n.\r\n";

    $send($msg);
    $read();
    $send('QUIT');
    fclose($sock);
}

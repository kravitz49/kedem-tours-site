<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

require_once __DIR__ . '/config.php';

// Проверка авторизации
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if ($auth !== 'Bearer ' . base64_encode(ADMIN_PASSWORD)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Файл не получен']);
    exit;
}

$file    = $_FILES['image'];
$maxSize = 5 * 1024 * 1024; // 5 MB

// Проверка размера
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'Файл слишком большой. Максимум 5 МБ']);
    exit;
}

// Проверка типа
$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo   = finfo_open(FILEINFO_MIME_TYPE);
$mime    = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Разрешены только JPG, PNG, GIF, WEBP']);
    exit;
}

// Уникальное имя файла
$ext      = ['image/jpeg'=>'jpg','image/png'=>'png','image/gif'=>'gif','image/webp'=>'webp'][$mime];
$filename = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$dir      = __DIR__ . '/images/';
$dest     = $dir . $filename;

if (!is_dir($dir)) mkdir($dir, 0755, true);

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сохранения файла']);
    exit;
}

// Определяем публичный URL
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host     = $_SERVER['HTTP_HOST'] ?? 'kedem-tours.com';
$url      = $protocol . '://' . $host . '/images/' . $filename;

echo json_encode(['success' => true, 'url' => $url, 'filename' => $filename]);

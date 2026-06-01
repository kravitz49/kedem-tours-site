<?php
// ── База данных ──────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'kravi071_Kedem-Tours');       // например: krav071_kedem
define('DB_USER', 'kravi071_kravitz49');  // например: krav071_user
define('DB_PASS', 'Mondeomk3!');

// ── Администратор ────────────────────────────────────────
define('ADMIN_PASSWORD', 'kedem2024admin');

// ── Email (Gmail SMTP) ───────────────────────────────────
define('NOTIFY_EMAIL',  'amtguide@gmail.com');   // куда слать уведомления
define('SMTP_USER',     'amtguide@gmail.com');   // ваш Gmail-адрес
define('SMTP_PASS',     '');                     // App Password из Google (16 символов без пробелов)
//
// Как получить App Password:
//   1. myaccount.google.com → Безопасность → Двухэтапная аутентификация → включить
//   2. myaccount.google.com → Безопасность → Пароли приложений
//   3. Создать пароль для "Другое" → скопировать 16 символов → вставить выше

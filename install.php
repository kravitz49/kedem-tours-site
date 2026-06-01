<?php
// Запустите этот файл ОДИН РАЗ для создания таблицы: kedem-tours.com/install.php
// После успешного выполнения — удалите файл с хостинга!
require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
                   DB_USER, DB_PASS,
                   [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        excursion   VARCHAR(255) NOT NULL,
        first_name  VARCHAR(100) NOT NULL,
        last_name   VARCHAR(100) NOT NULL,
        phone       VARCHAR(50)  NOT NULL,
        seats       TINYINT UNSIGNED NOT NULL,
        pickup      VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    echo '<p style="font-family:sans-serif;color:green;font-size:1.2rem">
            ✅ Таблица <b>orders</b> успешно создана!<br>
            <a href=\"/\">Перейти на сайт</a> |
            Удалите этот файл <b>install.php</b> с сервера.
          </p>';
} catch (Exception $e) {
    echo '<p style="font-family:sans-serif;color:red">❌ Ошибка: ' . $e->getMessage() . '</p>';
}

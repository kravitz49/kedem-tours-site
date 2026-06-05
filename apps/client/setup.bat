@echo off
echo === Kedem Tours — Клиентское приложение ===
echo.

echo [1/3] Устанавливаю зависимости...
call npm install
if errorlevel 1 ( echo ОШИБКА: npm install не выполнен. Установи Node.js с https://nodejs.org & pause & exit /b 1 )

echo [2/3] Добавляю Android платформу...
call npx cap add android
if errorlevel 1 ( echo ОШИБКА при добавлении Android & pause & exit /b 1 )

echo [3/3] Синхронизирую проект...
call npx cap sync android

echo.
echo ============================================
echo  ГОТОВО! Открываю Android Studio...
echo  Дальше в Android Studio:
echo  Build → Build Bundle/APK → Build APK(s)
echo ============================================
echo.
call npx cap open android
pause

@echo off
echo =====================================
echo   Kedem Tours — Клиентское приложение
echo =====================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ОШИБКА: Node.js не установлен.
  echo Скачай с https://nodejs.org и установи, потом запусти снова.
  pause & exit /b 1
)

echo [1/3] Устанавливаю пакеты...
call npm install
if errorlevel 1 ( echo Ошибка npm install & pause & exit /b 1 )

echo [2/3] Устанавливаю Expo CLI...
call npm install -g expo-cli eas-cli 2>nul

echo [3/3] Готово! Запускаю Expo...
echo.
echo ============================================================
echo  На телефоне установи приложение "Expo Go" из Google Play
echo  Сканируй QR-код — приложение откроется сразу!
echo  Для сборки APK: нажми "a" в этом окне (нужен Android Studio)
echo ============================================================
echo.
call npx expo start
pause

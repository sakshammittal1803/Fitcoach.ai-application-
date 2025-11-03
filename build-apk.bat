@echo off
echo ========================================
echo FitCoach AI - Build Options
echo ========================================
echo.

echo Choose your build method:
echo.
echo 1. EAS Cloud Build (requires Expo account)
echo 2. Local Development Build (Expo Go)
echo 3. View all build options
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto eas_build
if "%choice%"=="2" goto local_build
if "%choice%"=="3" goto show_options
goto invalid_choice

:eas_build
echo.
echo Checking EAS login status...
eas whoami
if %errorlevel% neq 0 (
    echo.
    echo You need to login to EAS first.
    echo Please run: eas login
    echo Then run this script again.
    pause
    exit /b 1
)
echo.
echo Starting EAS build...
eas build --platform android --profile preview
goto end

:local_build
echo.
echo Starting local development server...
echo Install Expo Go app on your Android device
echo Then scan the QR code that appears
echo.
npm start
goto end

:show_options
echo.
echo Opening build options guide...
start BUILD_WITHOUT_EAS.md
goto end

:invalid_choice
echo Invalid choice. Please run the script again.
pause
exit /b 1

:end
echo.
echo ========================================
echo Process completed!
echo ========================================
pause
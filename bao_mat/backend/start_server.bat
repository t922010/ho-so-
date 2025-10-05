@echo off
echo ========================================
echo    HE THONG BAO MAT - STARTING SERVER
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Checking .env file...
if not exist .env (
    echo WARNING: .env file not found!
    echo Please create .env file with your configuration
    echo See SECURITY.md for details
    pause
)

echo.
echo ========================================
echo    STARTING SECURITY SERVER...
echo ========================================
echo.
echo Server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

node congvao_baomat_server.js

echo.
echo Server stopped.
pause

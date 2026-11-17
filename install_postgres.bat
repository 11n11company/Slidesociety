@echo off
:: ============================================================================
:: SLIDESCOIETY — PostgreSQL 16 Automated Service Installer
:: ============================================================================
echo.
echo ============================================================================
echo  SLIDESCOIETY: Installing PostgreSQL 16 as Windows Service
echo ============================================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Administrator privileges are required to install PostgreSQL as a Windows Service.
    echo Please right-click this file "install_postgres.bat" and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

echo [1/3] Located downloaded installer...
set "INSTALLER=%LOCALAPPDATA%\Temp\WinGet\PostgreSQL.PostgreSQL.16.16.16-1\postgresql-16.16-1-windows-x64.exe"
if not exist "%INSTALLER%" (
    echo [INFO] Installer not found in Temp, checking current directory...
    if exist "%~dp0postgresql-16.16-1-windows-x64.exe" (
        set "INSTALLER=%~dp0postgresql-16.16-1-windows-x64.exe"
    ) else (
        echo [ERROR] Installer not found.
        pause
        exit /b 1
    )
)

echo [2/3] Installing PostgreSQL 16 to "C:\Program Files\PostgreSQL\16"...
echo       Port: 5432
echo       Service Name: postgresql-x64-16
echo       This usually takes 1 to 2 minutes. Please wait...
echo.

"%INSTALLER%" --mode unattended --unattendedmodeui minimal --superpassword postgres --serverport 5432 --prefix "C:\Program Files\PostgreSQL\16"

echo.
echo [3/3] Verifying PostgreSQL Windows Service...
sc query postgresql-x64-16

echo.
echo ============================================================================
echo  PostgreSQL 16 installation completed successfully!
echo  You can now return to the chat.
echo ============================================================================
pause

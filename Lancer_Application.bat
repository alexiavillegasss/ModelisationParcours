@echo off
setlocal
cd /d "%~dp0"
echo ======================================================================
echo    MODELISATION DES PARCOURS PERSONNES AGEES (PA) - VAR 83 / PACA
echo ======================================================================
echo.
echo Ouverture de l'application dans votre navigateur...
echo.

start "" "%~dp0index.html"

if errorlevel 1 (
    powershell.exe -Command "Start-Process '%~dp0index.html'"
)

exit

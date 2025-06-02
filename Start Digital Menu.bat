@echo off
title Digital Menu Startup
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "start.ps1"
pause

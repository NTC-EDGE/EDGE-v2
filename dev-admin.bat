@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   EDGE Admin - Fast Refresh ^& Auto-Reload Dev Server
echo ===================================================
echo.

:: 1. Check and Kill any existing process on port 3000
echo [1/2] Checking and freeing port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Terminating PID %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)
echo Port 3000 is ready.
echo.

:: 2. Launch Next.js Dev Server with Fast Refresh (HMR)
echo [2/2] Launching Admin App in Hot-Reload Dev Mode...
echo * Edits in src/ will automatically update in browser without rebuilding.
echo * Server URL: http://localhost:3000
echo.

cd /d "%~dp0apps\frontend\admin"

if exist "..\..\..\node_modules\next\dist\bin\next" (
    npx next dev -p 3000
) else (
    npm run dev -- -p 3000
)

pause

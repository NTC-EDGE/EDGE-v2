# EDGE Admin - Hot-Reload Development Server
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  EDGE Admin - Fast Refresh & Auto-Reload Dev Server" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kill any process on port 3000
Write-Host "[1/2] Checking port 3000..." -ForegroundColor Yellow
$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $pidToKill = $conn.OwningProcess
        Write-Host "Stopping process PID $pidToKill on port 3000..." -ForegroundColor DarkYellow
        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "Port 3000 is ready." -ForegroundColor Green
Write-Host ""

# 2. Start Dev server with HMR / Fast Refresh
Write-Host "[2/2] Launching Admin in Dev Mode with Fast Refresh..." -ForegroundColor Yellow
Write-Host "-> Updates in src/ will auto-reload without rebuild or rerun." -ForegroundColor Green
Write-Host "-> Dev server: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

$adminDir = Join-Path $PSScriptRoot "..\apps\frontend\admin"
Set-Location $adminDir

npm run dev -- -p 3000

# Double click dev-admin.bat in the project root, or                                                                                                                                     
#   • Run via PowerShell: .\scripts\dev-admin.ps1, or                                                                                                                                        
#   • Run directly: npm run dev --prefix apps/frontend/admin   

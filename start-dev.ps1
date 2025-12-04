# Script para iniciar Backend y Frontend en desarrollo
# Verifica puertos, mata procesos si es necesario

$BackendPort = 3000
$FrontendPort = 3002
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Iniciando stack de desarrollo ===" -ForegroundColor Yellow
Write-Host ""

# Función para liberar puerto
function Kill-Port {
    param([int]$Port)
    
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "Puerto $Port en uso (PID: $($process.OwningProcess))" -ForegroundColor Yellow
            
            $proc = Get-Process -Id $process.OwningProcess -ErrorAction SilentlyContinue
            if ($proc) {
                Stop-Process -Id $process.OwningProcess -Force
                Write-Host "✓ Proceso terminado" -ForegroundColor Green
                Start-Sleep -Seconds 1
            }
        }
        else {
            Write-Host "✓ Puerto $Port disponible" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "✓ Puerto $Port disponible" -ForegroundColor Green
    }
}

# Verificar y liberar puertos
Write-Host "Verificando puertos..." -ForegroundColor Yellow
Kill-Port $BackendPort
Kill-Port $FrontendPort

Write-Host ""

# Iniciar Backend
Write-Host "Iniciando Backend en puerto $BackendPort..." -ForegroundColor Yellow
Push-Location "$RootDir\app\backend-restaurants"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev"
Write-Host "✓ Backend iniciado" -ForegroundColor Green
Pop-Location

# Esperar a que backend esté listo
Start-Sleep -Seconds 3

Write-Host ""

# Iniciar Frontend
Write-Host "Iniciando Frontend en puerto $FrontendPort..." -ForegroundColor Yellow
Push-Location "$RootDir\app\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Write-Host "✓ Frontend iniciado" -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "=== Stack iniciado correctamente ===" -ForegroundColor Green
Write-Host "Backend:  http://localhost:$BackendPort" -ForegroundColor Green
Write-Host "Frontend: http://localhost:$FrontendPort" -ForegroundColor Green
Write-Host ""
Write-Host "Los servidores se ejecutan en ventanas de PowerShell separadas" -ForegroundColor Yellow

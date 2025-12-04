# Detiene el stack de desarrollo de Restaurants Backend E4

$BackendPort = 3000
$FrontendPort = 3002

Write-Host ""
Write-Host "Deteniendo stack de desarrollo..." -ForegroundColor Yellow
Write-Host ""

# Detener procesos en puerto 3000
$conn3000 = Get-NetTCPConnection -LocalPort $BackendPort -State Listen -ErrorAction SilentlyContinue
if ($conn3000) {
    foreach ($c in $conn3000) {
        $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "  Deteniendo $($proc.ProcessName) en puerto $BackendPort (PID: $($c.OwningProcess))" -ForegroundColor Yellow
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  OK - Proceso terminado" -ForegroundColor Green
    }
} else {
    Write-Host "  Puerto $BackendPort ya esta libre" -ForegroundColor Green
}

# Detener procesos en puerto 3002
$conn3002 = Get-NetTCPConnection -LocalPort $FrontendPort -State Listen -ErrorAction SilentlyContinue
if ($conn3002) {
    foreach ($c in $conn3002) {
        $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "  Deteniendo $($proc.ProcessName) en puerto $FrontendPort (PID: $($c.OwningProcess))" -ForegroundColor Yellow
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  OK - Proceso terminado" -ForegroundColor Green
    }
} else {
    Write-Host "  Puerto $FrontendPort ya esta libre" -ForegroundColor Green
}

Write-Host ""
Write-Host "Stack de desarrollo detenido" -ForegroundColor Green
Write-Host ""

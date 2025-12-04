<#
.SYNOPSIS
    Detiene el stack de desarrollo de Restaurants Backend E4
    
.DESCRIPTION
    Mata todos los procesos en los puertos del backend y frontend
    
.EXAMPLE
    .\stop-dev.ps1
    
.NOTES
    Autor: Equipo de Desarrollo
    Versión: 1.0.0
#>

$BackendPort = 3000
$FrontendPort = 3002

Write-Host ""
Write-Host "🛑 Deteniendo stack de desarrollo..." -ForegroundColor Yellow
Write-Host ""

function Stop-PortProcess {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "  ⚠️  Deteniendo '$($proc.ProcessName)' en puerto $Port (PID: $($conn.OwningProcess))" -ForegroundColor Yellow
                    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                    Write-Host "  ✓  Proceso terminado" -ForegroundColor Green
                }
            }
        }
        else {
            Write-Host "  ✓  Puerto $Port ya está libre" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  ✓  Puerto $Port ya está libre" -ForegroundColor Green
    }
}

Stop-PortProcess $BackendPort
Stop-PortProcess $FrontendPort

Write-Host ""
Write-Host "✓ Stack de desarrollo detenido" -ForegroundColor Green
Write-Host ""

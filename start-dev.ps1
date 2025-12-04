<#
.SYNOPSIS
    Script de desarrollo para Restaurants Backend E4
    
.DESCRIPTION
    Inicia el stack completo de desarrollo (Backend NestJS + Frontend Next.js)
    - Verifica y libera puertos automáticamente
    - Inicia Docker (PostgreSQL) si no está corriendo
    - Lanza backend y frontend en ventanas separadas
    
.PARAMETER SkipDocker
    Omite la verificación e inicio de Docker
    
.PARAMETER Kill
    Solo mata los procesos en los puertos sin iniciar servidores
    
.EXAMPLE
    .\start-dev.ps1
    Inicia el stack completo
    
.EXAMPLE
    .\start-dev.ps1 -Kill
    Solo libera los puertos 3000 y 3002
    
.NOTES
    Autor: Equipo de Desarrollo
    Fecha: Diciembre 2024
    Versión: 2.0.0
#>

param(
    [switch]$SkipDocker,
    [switch]$Kill
)

# Configuración
$BackendPort = 3000
$FrontendPort = 3002
$DockerContainerName = "restaurants_postgres"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Banner
function Show-Banner {
    Write-Host ""
    Write-Host "  ╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                                                       ║" -ForegroundColor Cyan
    Write-Host "  ║   🍽️  RESTAURANTS BACKEND E4 - Development Stack     ║" -ForegroundColor Cyan
    Write-Host "  ║                                                       ║" -ForegroundColor Cyan
    Write-Host "  ╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

# Función para liberar puerto
function Stop-PortProcess {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "  ⚠️  Puerto $Port en uso por '$($proc.ProcessName)' (PID: $($conn.OwningProcess))" -ForegroundColor Yellow
                    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                    Write-Host "  ✓  Proceso terminado" -ForegroundColor Green
                    Start-Sleep -Milliseconds 500
                }
            }
        }
        else {
            Write-Host "  ✓  Puerto $Port disponible" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  ✓  Puerto $Port disponible" -ForegroundColor Green
    }
}

# Verificar Docker
function Test-Docker {
    Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
    
    try {
        $dockerStatus = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ⚠️  Docker no está corriendo. Iniciando Docker Desktop..." -ForegroundColor Yellow
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
            Write-Host "  ⏳ Esperando a que Docker inicie (30 segundos)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
        }
        else {
            Write-Host "  ✓  Docker está corriendo" -ForegroundColor Green
        }
        
        # Verificar contenedor de PostgreSQL
        $container = docker ps --filter "name=$DockerContainerName" --format "{{.Names}}" 2>&1
        if ($container -ne $DockerContainerName) {
            Write-Host "  ⚠️  Contenedor '$DockerContainerName' no está corriendo" -ForegroundColor Yellow
            Write-Host "  🚀 Iniciando con docker-compose..." -ForegroundColor Yellow
            Push-Location $RootDir
            docker-compose up -d
            Pop-Location
            Start-Sleep -Seconds 3
        }
        else {
            Write-Host "  ✓  Contenedor PostgreSQL corriendo" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  ⚠️  No se pudo verificar Docker: $_" -ForegroundColor Yellow
    }
}

# Mostrar banner
Show-Banner

# Solo matar procesos si se usa -Kill
if ($Kill) {
    Write-Host "🔪 Liberando puertos..." -ForegroundColor Yellow
    Stop-PortProcess $BackendPort
    Stop-PortProcess $FrontendPort
    Write-Host ""
    Write-Host "✓ Puertos liberados" -ForegroundColor Green
    exit 0
}

# Verificar Docker (a menos que se omita)
if (-not $SkipDocker) {
    Test-Docker
    Write-Host ""
}

# Liberar puertos
Write-Host "🔌 Verificando puertos..." -ForegroundColor Yellow
Stop-PortProcess $BackendPort
Stop-PortProcess $FrontendPort
Write-Host ""

# Iniciar Backend
Write-Host "🚀 Iniciando Backend (NestJS)..." -ForegroundColor Yellow
$backendPath = "$RootDir\app\backend-restaurants"
$backendCmd = "cd '$backendPath'; Write-Host ''; Write-Host '=== BACKEND (NestJS) ===' -ForegroundColor Cyan; npm run start:dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Write-Host "  ✓  Backend iniciando en http://localhost:$BackendPort" -ForegroundColor Green

# Esperar a que el backend compile
Write-Host "  ⏳ Esperando compilación del backend..." -ForegroundColor Gray
Start-Sleep -Seconds 4

Write-Host ""

# Iniciar Frontend
Write-Host "🎨 Iniciando Frontend (Next.js)..." -ForegroundColor Yellow
$frontendPath = "$RootDir\app\frontend"
$frontendCmd = "cd '$frontendPath'; Write-Host ''; Write-Host '=== FRONTEND (Next.js) ===' -ForegroundColor Magenta; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
Write-Host "  ✓  Frontend iniciando en http://localhost:$FrontendPort" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  🎉 Stack de desarrollo iniciado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "  📍 URLs de acceso:" -ForegroundColor White
Write-Host "     • Frontend:  " -NoNewline; Write-Host "http://localhost:$FrontendPort" -ForegroundColor Cyan
Write-Host "     • Backend:   " -NoNewline; Write-Host "http://localhost:$BackendPort/api" -ForegroundColor Cyan
Write-Host "     • Swagger:   " -NoNewline; Write-Host "http://localhost:$BackendPort/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  💡 Consejos:" -ForegroundColor White
Write-Host "     • Cierra las ventanas de PowerShell para detener los servidores"
Write-Host "     • Usa './start-dev.ps1 -Kill' para liberar puertos"
Write-Host "     • Usa './start-dev.ps1 -SkipDocker' si Docker ya está corriendo"
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

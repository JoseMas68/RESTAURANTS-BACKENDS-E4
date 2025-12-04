#!/bin/bash

#############################################################################
#
#  RESTAURANTS BACKEND E4 - Development Stack Launcher
#
#  Descripción: Inicia el stack completo de desarrollo
#               (Backend NestJS + Frontend Next.js + PostgreSQL)
#
#  Uso:
#    ./start-dev.sh           # Inicia todo el stack
#    ./start-dev.sh --kill    # Solo libera los puertos
#    ./start-dev.sh --no-docker  # Omite verificación de Docker
#
#  Autor: Equipo de Desarrollo
#  Versión: 2.0.0
#  Fecha: Diciembre 2024
#
#############################################################################

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuración
BACKEND_PORT=3000
FRONTEND_PORT=3002
DOCKER_CONTAINER="restaurants_postgres"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Variables de control
SKIP_DOCKER=false
KILL_ONLY=false

# Procesar argumentos
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --kill|-k) KILL_ONLY=true ;;
        --no-docker|-n) SKIP_DOCKER=true ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --kill, -k      Solo libera los puertos sin iniciar servidores"
            echo "  --no-docker, -n Omite la verificación de Docker"
            echo "  --help, -h      Muestra esta ayuda"
            exit 0
            ;;
        *) echo "Opción desconocida: $1"; exit 1 ;;
    esac
    shift
done

# Mostrar banner
show_banner() {
    echo ""
    echo -e "${CYAN}  ╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}  ║                                                       ║${NC}"
    echo -e "${CYAN}  ║   🍽️  RESTAURANTS BACKEND E4 - Development Stack     ║${NC}"
    echo -e "${CYAN}  ║                                                       ║${NC}"
    echo -e "${CYAN}  ╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Función para matar procesos en un puerto
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "  ${YELLOW}⚠️  Puerto $port en uso (PIDs: $pids)${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}✓  Procesos terminados${NC}"
            sleep 0.5
        else
            echo -e "  ${RED}✗  No se pudieron terminar los procesos${NC}"
            return 1
        fi
    else
        echo -e "  ${GREEN}✓  Puerto $port disponible${NC}"
    fi
    return 0
}

# Verificar Docker
check_docker() {
    echo -e "${YELLOW}📦 Verificando Docker...${NC}"
    
    if ! docker info >/dev/null 2>&1; then
        echo -e "  ${YELLOW}⚠️  Docker no está corriendo${NC}"
        echo -e "  ${YELLOW}Por favor, inicia Docker Desktop manualmente${NC}"
        return 1
    else
        echo -e "  ${GREEN}✓  Docker está corriendo${NC}"
    fi
    
    # Verificar contenedor PostgreSQL
    if ! docker ps --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER}$"; then
        echo -e "  ${YELLOW}⚠️  Contenedor '$DOCKER_CONTAINER' no está corriendo${NC}"
        echo -e "  ${YELLOW}🚀 Iniciando con docker-compose...${NC}"
        cd "$SCRIPT_DIR"
        docker-compose up -d
        sleep 3
    else
        echo -e "  ${GREEN}✓  Contenedor PostgreSQL corriendo${NC}"
    fi
}

# Cleanup al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servidores...${NC}"
    
    # Matar procesos de los puertos
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    echo -e "${GREEN}✓ Servidores detenidos${NC}"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# --- INICIO DEL SCRIPT ---

show_banner

# Solo matar procesos si se usa --kill
if [ "$KILL_ONLY" = true ]; then
    echo -e "${YELLOW}🔪 Liberando puertos...${NC}"
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    echo ""
    echo -e "${GREEN}✓ Puertos liberados${NC}"
    exit 0
fi

# Verificar Docker (a menos que se omita)
if [ "$SKIP_DOCKER" = false ]; then
    check_docker
    echo ""
fi

# Liberar puertos
echo -e "${YELLOW}🔌 Verificando puertos...${NC}"
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT
echo ""

# Iniciar Backend
echo -e "${YELLOW}🚀 Iniciando Backend (NestJS)...${NC}"
cd "$SCRIPT_DIR/app/backend-restaurants"
npm run start:dev &
BACKEND_PID=$!
echo -e "  ${GREEN}✓  Backend iniciando en http://localhost:$BACKEND_PORT (PID: $BACKEND_PID)${NC}"

# Esperar a que el backend compile
echo -e "  ${WHITE}⏳ Esperando compilación del backend...${NC}"
sleep 4

echo ""

# Iniciar Frontend
echo -e "${YELLOW}🎨 Iniciando Frontend (Next.js)...${NC}"
cd "$SCRIPT_DIR/app/frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "  ${GREEN}✓  Frontend iniciando en http://localhost:$FRONTEND_PORT (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}🎉 Stack de desarrollo iniciado correctamente!${NC}"
echo ""
echo -e "  ${WHITE}📍 URLs de acceso:${NC}"
echo -e "     • Frontend:  ${CYAN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "     • Backend:   ${CYAN}http://localhost:$BACKEND_PORT/api${NC}"
echo -e "     • Swagger:   ${CYAN}http://localhost:$BACKEND_PORT/api/docs${NC}"
echo ""
echo -e "  ${WHITE}💡 Consejos:${NC}"
echo -e "     • Presiona Ctrl+C para detener ambos servidores"
echo -e "     • Usa './start-dev.sh --kill' para liberar puertos"
echo -e "     • Usa './start-dev.sh --no-docker' si Docker ya está corriendo"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Esperar a que terminen los procesos
wait

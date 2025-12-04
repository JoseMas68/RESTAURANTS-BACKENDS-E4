#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Puertos
BACKEND_PORT=3000
FRONTEND_PORT=3002

echo -e "${YELLOW}=== Iniciando stack de desarrollo ===${NC}\n"

# Función para matar procesos en un puerto
kill_port() {
    local port=$1
    local process_info=$(lsof -ti :$port 2>/dev/null)
    
    if [ ! -z "$process_info" ]; then
        echo -e "${YELLOW}Puerto $port en uso. PID: $process_info${NC}"
        kill -9 $process_info 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Proceso terminado${NC}"
            sleep 1
        else
            echo -e "${RED}✗ No se pudo terminar el proceso${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}✓ Puerto $port disponible${NC}"
    fi
    return 0
}

# Verificar y liberar puertos
echo -e "${YELLOW}Verificando puertos...${NC}"
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

echo ""

# Lanzar Backend
echo -e "${YELLOW}Iniciando Backend en puerto $BACKEND_PORT...${NC}"
cd "app/backend-restaurants"
npm run start:dev &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend PID: $BACKEND_PID${NC}"

# Esperar a que el backend esté listo
sleep 3

echo ""

# Lanzar Frontend
echo -e "${YELLOW}Iniciando Frontend en puerto $FRONTEND_PORT...${NC}"
cd "../frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend PID: $FRONTEND_PID${NC}"

echo ""
echo -e "${GREEN}=== Stack iniciado correctamente ===${NC}"
echo -e "${GREEN}Backend:  http://localhost:$BACKEND_PORT${NC}"
echo -e "${GREEN}Frontend: http://localhost:$FRONTEND_PORT${NC}"
echo ""
echo -e "${YELLOW}Para detener presiona Ctrl+C${NC}"
echo ""

# Esperar indefinidamente
wait

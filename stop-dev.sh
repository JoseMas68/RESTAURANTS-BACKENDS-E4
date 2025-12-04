#!/bin/bash

#############################################################################
#
#  RESTAURANTS BACKEND E4 - Stop Development Stack
#
#  Descripción: Detiene todos los procesos del stack de desarrollo
#
#  Uso:
#    ./stop-dev.sh
#
#  Autor: Equipo de Desarrollo
#  Versión: 1.0.0
#
#############################################################################

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_PORT=3000
FRONTEND_PORT=3002

echo ""
echo -e "${YELLOW}🛑 Deteniendo stack de desarrollo...${NC}"
echo ""

kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "  ${YELLOW}⚠️  Deteniendo procesos en puerto $port (PIDs: $pids)${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        echo -e "  ${GREEN}✓  Procesos terminados${NC}"
    else
        echo -e "  ${GREEN}✓  Puerto $port ya está libre${NC}"
    fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

echo ""
echo -e "${GREEN}✓ Stack de desarrollo detenido${NC}"
echo ""

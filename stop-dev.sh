#!/bin/bash

#############################################################################
#
#  RESTAURANTS BACKEND E4 - Stop Development Stack
#
#  Descripción: Detiene todos los procesos del stack de desarrollo
#               Compatible con Linux, macOS y Git Bash en Windows
#
#  Uso:
#    ./stop-dev.sh
#
#  Autor: Equipo de Desarrollo
#  Versión: 1.1.0
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
echo -e "${YELLOW}Deteniendo stack de desarrollo...${NC}"
echo ""

# Detectar sistema operativo
is_windows() {
    [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ -n "$WINDIR" ]]
}

kill_port_windows() {
    local port=$1
    # Usar netstat y taskkill en Windows
    local pid=$(netstat -ano 2>/dev/null | grep ":$port " | grep "LISTENING" | awk '{print $5}' | head -1)
    
    if [ ! -z "$pid" ] && [ "$pid" != "0" ]; then
        echo -e "  ${YELLOW}Deteniendo proceso en puerto $port (PID: $pid)${NC}"
        taskkill //F //PID $pid >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}OK - Proceso terminado${NC}"
        else
            echo -e "  ${RED}Error al terminar proceso${NC}"
        fi
    else
        echo -e "  ${GREEN}Puerto $port ya esta libre${NC}"
    fi
}

kill_port_unix() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "  ${YELLOW}Deteniendo procesos en puerto $port (PIDs: $pids)${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        echo -e "  ${GREEN}OK - Procesos terminados${NC}"
    else
        echo -e "  ${GREEN}Puerto $port ya esta libre${NC}"
    fi
}

kill_port() {
    local port=$1
    if is_windows; then
        kill_port_windows $port
    else
        kill_port_unix $port
    fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

echo ""
echo -e "${GREEN}Stack de desarrollo detenido${NC}"
echo ""

# 🚀 Guía de Scripts de Desarrollo

Esta guía documenta los scripts de automatización para el desarrollo del proyecto **Restaurants Backend E4**.

---

## 📁 Estructura de Scripts

```
restaurants-backend-e4/
├── start-dev.ps1     # Iniciar stack (Windows PowerShell)
├── start-dev.sh      # Iniciar stack (Linux/macOS)
├── stop-dev.ps1      # Detener stack (Windows PowerShell)
├── stop-dev.sh       # Detener stack (Linux/macOS)
└── docker-compose.yml
```

---

## 🖥️ Windows (PowerShell)

### Iniciar el Stack de Desarrollo

```powershell
# Desde la raíz del proyecto
.\start-dev.ps1
```

**¿Qué hace este script?**
1. ✅ Muestra un banner informativo
2. ✅ Verifica que Docker esté corriendo (lo inicia si es necesario)
3. ✅ Verifica que el contenedor PostgreSQL esté activo
4. ✅ Libera los puertos 3000 y 3002 si están ocupados
5. ✅ Inicia el **Backend (NestJS)** en una ventana separada
6. ✅ Inicia el **Frontend (Next.js)** en otra ventana separada
7. ✅ Muestra las URLs de acceso

### Opciones del Script

| Opción | Descripción |
|--------|-------------|
| `-Kill` | Solo libera los puertos sin iniciar servidores |
| `-SkipDocker` | Omite la verificación de Docker |

```powershell
# Solo liberar puertos
.\start-dev.ps1 -Kill

# Iniciar sin verificar Docker
.\start-dev.ps1 -SkipDocker
```

### Detener el Stack

```powershell
# Opción 1: Cerrar las ventanas de PowerShell manualmente

# Opción 2: Usar el script de stop
.\stop-dev.ps1

# Opción 3: Usar start-dev con -Kill
.\start-dev.ps1 -Kill
```

---

## 🐧 Linux / macOS (Bash)

### Iniciar el Stack de Desarrollo

```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x start-dev.sh stop-dev.sh

# Iniciar
./start-dev.sh
```

### Opciones del Script

| Opción | Descripción |
|--------|-------------|
| `--kill`, `-k` | Solo libera los puertos sin iniciar servidores |
| `--no-docker`, `-n` | Omite la verificación de Docker |
| `--help`, `-h` | Muestra la ayuda |

```bash
# Solo liberar puertos
./start-dev.sh --kill

# Iniciar sin verificar Docker
./start-dev.sh --no-docker
```

### Detener el Stack

```bash
# Opción 1: Presionar Ctrl+C en la terminal
# (el script tiene trap para cleanup automático)

# Opción 2: Usar el script de stop
./stop-dev.sh
```

---

## 🌐 URLs de Acceso

Una vez iniciado el stack, puedes acceder a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3002 | Aplicación Next.js |
| **Backend API** | http://localhost:3000/api | API REST NestJS |
| **Swagger Docs** | http://localhost:3000/api/docs | Documentación interactiva |
| **PostgreSQL** | localhost:5432 | Base de datos |

---

## 🔧 Requisitos

Antes de ejecutar los scripts, asegúrate de tener instalado:

- **Node.js** v18+ y npm
- **pnpm** (para el backend)
- **Docker Desktop** con docker-compose
- **PowerShell 5.1+** (Windows) o **Bash** (Linux/macOS)

---

## ⚠️ Solución de Problemas

### Puerto ocupado
```powershell
# Windows
.\start-dev.ps1 -Kill

# Linux/macOS
./start-dev.sh --kill
```

### Docker no inicia
1. Abre Docker Desktop manualmente
2. Espera a que esté completamente iniciado
3. Ejecuta el script con `-SkipDocker` o `--no-docker`

### El backend no compila
```powershell
cd app/backend-restaurants
pnpm install
```

### El frontend no inicia
```powershell
cd app/frontend
npm install
```

---

## 📊 Ejemplo de Ejecución

```
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🍽️  RESTAURANTS BACKEND E4 - Development Stack     ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝

📦 Verificando Docker...
  ✓  Docker está corriendo
  ✓  Contenedor PostgreSQL corriendo

🔌 Verificando puertos...
  ✓  Puerto 3000 disponible
  ✓  Puerto 3002 disponible

🚀 Iniciando Backend (NestJS)...
  ✓  Backend iniciando en http://localhost:3000
  ⏳ Esperando compilación del backend...

🎨 Iniciando Frontend (Next.js)...
  ✓  Frontend iniciando en http://localhost:3002

═══════════════════════════════════════════════════════════

  🎉 Stack de desarrollo iniciado correctamente!

  📍 URLs de acceso:
     • Frontend:  http://localhost:3002
     • Backend:   http://localhost:3000/api
     • Swagger:   http://localhost:3000/api/docs

  💡 Consejos:
     • Cierra las ventanas de PowerShell para detener los servidores
     • Usa './start-dev.ps1 -Kill' para liberar puertos
     • Usa './start-dev.ps1 -SkipDocker' si Docker ya está corriendo

═══════════════════════════════════════════════════════════
```

---

## 📝 Notas de Versión

### v2.0.0 (Diciembre 2024)
- ✨ Banner visual mejorado
- ✨ Verificación automática de Docker
- ✨ Inicio automático del contenedor PostgreSQL
- ✨ Parámetros `-Kill` y `-SkipDocker`
- ✨ Mejor manejo de errores
- ✨ Scripts de stop para ambas plataformas
- ✨ Documentación completa

### v1.0.0 (Versión inicial)
- Inicio básico de backend y frontend
- Verificación de puertos

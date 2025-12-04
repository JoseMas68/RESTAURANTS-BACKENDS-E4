# P2: Landing del Restaurante - Concepto UI

## Visión General

Landing page responsiva y moderna que presenta un restaurante específico, sus menús, servicios y permite a los clientes explorar opciones, leer reseñas y realizar reservas. Se conecta completamente con la API E4 del backend.

---

## Estructura de Secciones

### 1. **Header / Navegación**

**Ubicación:** Fija en la parte superior

**Elementos:**
- Logo del restaurante
- Menú de navegación (Inicio, Menú, Reservas, Reseñas, Contacto)
- Botón de idioma (i18n)
- CTA: "Reservar Mesa" (modal/página)

**Datos de la API:**
- GET `/restaurants/{identifier}` → Nombre, logo, contacto

**Conexión:**
- Cargar nombre y branding del restaurante al iniciar

---

### 2. **Hero Section**

**Ubicación:** Primera pantalla después del header

**Elementos:**
- Imagen de portada del restaurante (hero image)
- Título principal con nombre del restaurante
- Subtítulo (descripción breve: tipo de cocina, ubicación)
- CTA principal: "Explorar Menú" y "Reservar Ahora"
- Rating/Calificación promedio visible

**Datos de la API:**
- GET `/restaurants/{identifier}`
  - `name`
  - `description`
  - `imageUrl`
  - `cuisine` (tipo de cocina)
  - `location`

**Datos opcionales:**
- GET `/reviews?restaurantId={id}` (primer call) → `averageRating`

**Conexión:**
- Consumir datos generales del restaurante e inyectarlos en el diseño
- Mostrar rating promedio si hay reseñas

---

### 3. **Información del Restaurante**

**Ubicación:** Sección de bienvenida/about

**Elementos:**
- Descripción completa del restaurante
- Horarios de apertura (Monday-Sunday)
- Dirección e información de contacto
- Teléfono, email, redes sociales
- Mapa interactivo (Google Maps embed)
- Capacidad de sillas/mesas

**Datos de la API:**
- GET `/restaurants/{identifier}`
  - `description` (expandido)
  - `schedule` (objeto con días y horarios)
  - `address`
  - `phone`
  - `email`
  - `location` (lat/lng para mapa)
  - `capacity`

**Conexión:**
- Renderizar horarios dinámicamente desde `schedule`
- Mostrar indicador "Abierto/Cerrado" basado en hora actual vs `schedule`
- Embeber mapa con coordenadas de `location`

---

### 4. **Sección de Menús (Categorizado)**

**Ubicación:** Sección central/destacada

**Elementos:**
- Tabs/Acordeones por categoría de menú (Entrantes, Platos Principales, Postres, Bebidas, etc.)
- Para cada categoría:
  - Nombre e imagen del plato
  - Descripción breve
  - Precio
  - Iconos: vegetariano, picante, sin gluten, etc.
  - Disponibilidad (isActive)

**Datos de la API:**
- GET `/restaurants/{restaurantId}/menus` → Lista de categorías (Menus)
  - `id`
  - `name`
  - `description`
  - `imageUrl`
  - `displayOrder`

- GET `/restaurants/{restaurantId}/menu` → Menú completo estructurado
  - Retorna categorías con sus productos anidados

- GET `/restaurants/{restaurantId}/menu-items` → Todos los items
  - `id`
  - `name`
  - `description`
  - `price`
  - `imageUrl`
  - `isAvailable`
  - `category` (relación)

**Conexión:**
- Consumir `/restaurants/{restaurantId}/menu` para estructura jerárquica
- Renderizar categorías como tabs/acordeones
- Mostrar solo items donde `isAvailable === true`
- Ordenar por `displayOrder`
- Cachear datos del menú en estado local (sesión)

---

### 5. **Sección de Reseñas/Testimonios**

**Ubicación:** Antes de footer o entre menú y reservas

**Elementos:**
- Carrusel o grid de reseñas destacadas
- Para cada reseña:
  - Nombre del cliente
  - Avatar/Inicial
  - Rating (estrellas, 1-5)
  - Texto de la reseña
  - Fecha
  - Respuesta del restaurante (si existe)
- Rating promedio general
- Link "Ver todas las reseñas"

**Datos de la API:**
- GET `/reviews?restaurantId={id}&limit=5&sort=recent` → Reseñas recientes destacadas
  - `id`
  - `customerId`
  - `rating`
  - `title`
  - `comment`
  - `createdAt`
  - `response` (respuesta del restaurante)

- GET `/restaurants/{id}/reviews` → Datos para promedio
  - Retorna aggregate: `averageRating`, `totalReviews`

**Conexión:**
- Consumir endpoint de reseñas filtradas
- Calcular promedio en el cliente o desde backend
- Mostrar reseñas en orden descendente (más recientes)
- Permitir expandir "Ver todas" → Modal o página dedicada

---

### 6. **Sección de Reservas**

**Ubicación:** Sección dedicada o modal accesible desde múltiples puntos

**Elementos:**
- Formulario de reserva:
  - Fecha (date picker, solo fechas futuras, respetando horarios)
  - Hora (select con horarios disponibles)
  - Cantidad de personas (number input)
  - Tipo de mesa (si aplica)
  - Nombre del cliente
  - Email
  - Teléfono
  - Notas especiales (opcional)
- Botón "Confirmar Reserva"
- Indicador de disponibilidad en tiempo real

**Datos de la API:**
- GET `/restaurants/{restaurantId}/bookings/availability?date={YYYY-MM-DD}&partySize={n}`
  - `availableTables` (lista de mesas disponibles)
  - `timeSlots` (horas disponibles)

- POST `/restaurants/{restaurantId}/bookings`
  - Body: `{ date, time, partySize, customerId, notes, tableId (opcional) }`
  - Response: `{ id, status, confirmationCode }`

- GET `/restaurants/{restaurantId}/schedule` → Para mostrar horarios válidos

**Conexión:**
- Query disponibilidad antes de permitir reserva
- Enviar POST al crear reserva
- Mostrar confirmación con código de reserva
- Validar horarios contra `schedule` del restaurante

---

### 7. **Sección de Contacto**

**Ubicación:** Footer o sección separada

**Elementos:**
- Información de contacto (teléfono, email, dirección)
- Formulario de contacto (nombre, email, asunto, mensaje)
- Redes sociales (links)
- Horarios de atención
- Mapa embebido

**Datos de la API:**
- GET `/restaurants/{identifier}`
  - `phone`
  - `email`
  - `address`
  - `location` (para mapa)
  - `schedule`

**Conexión:**
- Mostrar datos estáticos del restaurante
- Formulario de contacto podría ser backend (opcional en E4)

---

### 8. **Footer**

**Ubicación:** Base de la página

**Elementos:**
- Logo
- Links rápidos (Menú, Reservas, Reseñas)
- Información legal (términos, privacidad)
- Redes sociales
- Copyright

**Datos de la API:**
- GET `/restaurants/{identifier}` → Redes sociales, logo

---

## Flujo de Datos - Llamadas API

### **Carga Inicial (Page Load)**

```
1. GET /restaurants/{identifier}
   └─ Obtener datos generales del restaurante

2. GET /restaurants/{restaurantId}/menus
   └─ Obtener estructura de menús

3. GET /restaurants/{restaurantId}/reviews?limit=5
   └─ Obtener reseñas destacadas
```

### **Interacción con Menú**

```
- GET /restaurants/{restaurantId}/menu-items?categoryId={id}
  └─ Listar items por categoría
```

### **Consulta de Disponibilidad (Reservas)**

```
- GET /restaurants/{restaurantId}/bookings/availability
  └─ Query params: date, partySize, tableId (opcional)
  └─ Retorna slots disponibles
```

### **Crear Reserva**

```
- POST /restaurants/{restaurantId}/bookings
  └─ Body: { date, time, partySize, customerId, notes }
  └─ Response: confirmación con ID de reserva
```

### **Ver Todas las Reseñas**

```
- GET /reviews?restaurantId={id}&page=1&limit=20&sort=recent
  └─ Reseñas paginadas
```

---

## Responsabilidad por Sección

| Sección | Datos Principales | Endpoint(s) E4 |
|---------|-------------------|---|
| Header | Logo, nombre, contacto | GET `/restaurants/{id}` |
| Hero | Imagen, descripción, rating | GET `/restaurants/{id}`, GET `/reviews` |
| Info Restaurante | Horarios, dirección, capacidad | GET `/restaurants/{id}` |
| Menús | Categorías, items, precios | GET `/restaurants/{id}/menus`, GET `/restaurants/{id}/menu-items` |
| Reseñas | Rating, comentarios, respuestas | GET `/reviews?restaurantId={id}` |
| Reservas | Disponibilidad, confirmación | GET `/bookings/availability`, POST `/bookings` |
| Contacto | Email, teléfono, dirección | GET `/restaurants/{id}` |
| Footer | Links, redes sociales | GET `/restaurants/{id}` |

---

## Consideraciones Técnicas

### **Autenticación y Autorización**
- Landing es **pública** (sin autenticación requerida)
- GET endpoints de restaurante, menús, reseñas: sin auth
- POST `/bookings` podría requerir:
  - Email del cliente (sin login)
  - O integración futura con sistema de usuarios

### **Caching y Performance**
- Cache de `/restaurants/{id}` en localStorage (30 min)
- Cache de menús (1 hora)
- Reseñas: cache limitado (datos frescos cada 5 min)

### **Validación en Cliente**
- Validar horarios de reserva contra `schedule`
- Validar disponibilidad en tiempo real
- Mostrar mensajes de error claros

### **Responsive Design**
- Mobile-first approach
- Header: menú colapsable (hamburguesa)
- Menús: tabs → acordeones en mobile
- Reseñas: carrusel en mobile, grid en desktop

### **Accesibilidad**
- ARIA labels en formularios
- Contraste de colores WCAG AA
- Navegación por teclado

---

## Flujo de Usuario - Escenario Típico

```
1. Usuario entra a la landing
   └─ Se cargan datos del restaurante (hero, horarios, info)

2. Explora secciones
   └─ Scroll → Ver menús, reseñas, info de contacto

3. Interés en reservar
   └─ Hace clic en "Reservar Mesa"
   └─ Se abre modal/formulario de reservas

4. Selecciona fecha, hora, cantidad
   └─ Query /bookings/availability
   └─ Se muestran slots disponibles

5. Completa datos personales y confirma
   └─ POST /bookings
   └─ Se muestra confirmación con código

6. Recibe email con detalles (backend E4 envía)
   └─ Usuario puede guardar confirmación
```

---

## Próximos Pasos

1. **Diseño visual** (Figma/Mockups)
2. **Selección de tech stack** (React, Next.js, Vue, etc.)
3. **Componentes reutilizables** (Card, Modal, Form, Rating, etc.)
4. **Integración de API** (cliente HTTP, manejo de errores)
5. **Tests** (unitarios, E2E para flujo de reservas)
6. **Deploy** (Vercel, Netlify, o servidor propio)

---

## Referencias

- **Backend API**: E4 Restaurants Backend (NestJS + Prisma)
- **Endpoints disponibles**: Ver `docs/e4/api_contracts.md`
- **Base de datos**: PostgreSQL (schema en `prisma/schema.prisma`)

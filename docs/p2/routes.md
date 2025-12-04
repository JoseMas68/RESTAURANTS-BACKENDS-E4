# P2: Rutas y Navegación Frontend

## Overview

Documentación de las rutas principales de la landing P2 del proyecto Restaurants E4. Cada ruta define su propósito, datos consumidos, componentes principales y manejo de estados (loading, error, empty).

---

## Ruta: `/` (Home / Landing Principal)

### **Propósito**
Landing page principal. Punto de entrada a la aplicación. Presenta un listado de restaurantes disponibles o destaca restaurantes destacados, permitiendo al usuario explorar opciones y navegar a detalles específicos.

### **Tipo de Ruta**
- **Pública**, sin autenticación requerida
- **SEO-friendly** (next.js: estática o ISR)

### **Datos Consumidos**

#### Llamadas API Principales
```
GET /restaurants?page=1&limit=10&sort=rating
├─ Retorna lista paginada de restaurantes
├─ Parámetros opcionales:
│  ├─ page: número de página (default: 1)
│  ├─ limit: items por página (default: 10)
│  ├─ sort: 'rating', 'newest', 'popularity'
│  ├─ search: búsqueda por nombre/descripción (opcional)
│  └─ cuisine: filtro por tipo de cocina (opcional)
└─ Response:
   ├─ data: Array de restaurantes
   │  ├─ id
   │  ├─ name
   │  ├─ description
   │  ├─ imageUrl (hero image)
   │  ├─ cuisine
   │  ├─ address
   │  ├─ phone
   │  ├─ rating (promedio)
   │  └─ totalReviews
   ├─ pagination:
   │  ├─ total
   │  ├─ page
   │  ├─ limit
   │  └─ pages
   └─ timestamp (para caché)
```

#### Llamadas API Secundarias (si aplica)
```
GET /restaurants/{id}/reviews?limit=3
├─ Obtener reseñas destacadas por restaurante
├─ Muestra en card de preview
└─ Respuesta: Array de reseñas (3 más recientes)
```

### **Componentes Principales**

```
<HomePage>
  ├─ <Header />
  │  ├─ Logo
  │  ├─ SearchBar
  │  │  ├─ Input de búsqueda
  │  │  ├─ Filtros (cuisine, rating)
  │  │  └─ Botón buscar
  │  └─ Nav Links
  ├─ <HeroSection />
  │  ├─ Background image
  │  ├─ Título "Descubre Restaurantes"
  │  ├─ Descripción breve
  │  └─ CTA: "Explorar"
  ├─ <RestaurantGrid>
  │  ├─ <RestaurantCard /> (x N)
  │  │  ├─ Imagen
  │  │  ├─ Nombre
  │  │  ├─ Descripción corta
  │  │  ├─ Rating badge
  │  │  ├─ Ubicación
  │  │  ├─ Tipo de cocina
  │  │  ├─ Link "Ver Menú"
  │  │  └─ Link "Reservar"
  │  └─ <Pagination />
  │     ├─ Botones prev/next
  │     ├─ Indicador página actual
  │     └─ Selector de página
  ├─ <FiltersSidebar /> (opcional, mobile: modal)
  │  ├─ Filtro por cuisine
  │  ├─ Filtro por rating
  │  ├─ Filtro por rango de precios (si aplica)
  │  ├─ Botón "Aplicar filtros"
  │  └─ Botón "Limpiar"
  └─ <Footer />
```

### **Estados**

#### **Estado: Loading**
```
Trigger: Al cargar la página o cambiar página/filtros

Comportamiento:
- Mostrar skeleton loaders en grid (5-10 placeholders)
- Deshabilitar controles de filtro/paginación
- Spinner en header de búsqueda (opcional)
- Mensaje: "Cargando restaurantes..."

UI Component: <SkeletonLoader /> | <LoadingSpinner />
```

#### **Estado: Success (Datos Cargados)**
```
Condición: response.status === 200 && data.length > 0

Comportamiento:
- Renderizar cards de restaurantes
- Mostrar paginación activa
- Habilitar filtros
- Mostrar contador "Mostrando X de Y restaurantes"
```

#### **Estado: Empty (Sin Resultados)**
```
Condición: response.status === 200 && data.length === 0

Comportamiento:
- Mostrar ilustración/icono de "Sin resultados"
- Mensaje: "No encontramos restaurantes que coincidan con tu búsqueda"
- Sugerencias: "Intenta cambiar los filtros" o "Ver todos los restaurantes"
- Botón para limpiar filtros

UI Component: <EmptyState />
```

#### **Estado: Error**
```
Condiciones: response.status >= 400

Casos:
1. Error de red (timeout, offline)
   - Mostrar: "Error de conexión. Intenta de nuevo."
   - Botón: "Reintentar"

2. Error servidor (500, 502, 503)
   - Mostrar: "El servidor no está disponible. Intenta más tarde."
   - Botón: "Volver a Home"

3. Error de datos (400, 422)
   - Mostrar: "Parámetros inválidos"
   - Botón: "Limpiar búsqueda"

UI Component: <ErrorBoundary /> + <ErrorAlert />
Recovery: Auto-retry después de 3 segundos o manual con botón
```

### **Flujo de Navegación**
```
HOME (/):
├─ Click en card de restaurante → ir a /restaurants/[id]
├─ Click en "Ver Menú" → ir a /restaurants/[id]#menu
├─ Click en "Reservar" → ir a /restaurants/[id]#reserve
└─ Búsqueda / Filtros → query params en URL (/? search=..., /? cuisine=...)
```

### **Query Parameters Soportados**
```
GET /?search=pizza&cuisine=italian&page=1&sort=rating

Parámetros:
- search: búsqueda por nombre/descripción
- cuisine: filtro por tipo de cocina
- page: página actual (default: 1)
- sort: orden (rating, newest, popularity)
- minRating: rating mínimo (1-5)
- maxPrice: precio máximo (opcional)
```

### **Caché y Revalidación**
```
- Datos de lista: ISR 1 hora (revalidate: 3600)
- Datos de búsqueda/filtros: cache temporal en estado local (5 min)
- Invalidar caché al cambiar filtros
```

---

## Ruta: `/restaurants` (Listado Completo)

### **Propósito**
Página de listado completo de restaurantes con búsqueda avanzada, filtros, ordenamiento y paginación. Más detallada que la home.

### **Tipo de Ruta**
- **Pública**, sin autenticación
- **Dinámica**, permite query params complejos
- **SEO**: Ligeramente menos prioritario que `/`

### **Datos Consumidos**

#### Llamadas API Principales
```
GET /restaurants?page={page}&limit={limit}&search={q}&cuisine={c}&sort={s}
├─ Response: Lista paginada completa (misma que home, pero limit superior)
├─ Limit por defecto: 20 (vs 10 en home)
├─ Soporta múltiples filtros simultáneos
└─ Timestamp para deduplicación de requests
```

#### Llamadas API Secundarias
```
GET /restaurants/filters/cuisines
├─ Retorna lista de tipos de cocina disponibles
└─ Para poblar dropdown de filtros

GET /restaurants?limit=100&search={q}
├─ Búsqueda full-text (si se tipea en search bar)
└─ Debounce: 300ms
```

### **Componentes Principales**

```
<RestaurantsPage>
  ├─ <Header />
  ├─ <PageTitle>
  │  ├─ Título: "Todos los Restaurantes"
  │  ├─ Descripción
  │  └─ Contador total
  ├─ <SearchAndFilterBar>
  │  ├─ <SearchInput />
  │  │  ├─ Placeholder: "Buscar por nombre, cocina..."
  │  │  ├─ Debounce: 300ms
  │  │  └─ Icono de búsqueda
  │  ├─ <FilterDropdown cuisine />
  │  ├─ <FilterDropdown rating />
  │  ├─ <SortSelect />
  │  │  └─ Opciones: Rating, Más nuevo, Popularidad, A-Z
  │  ├─ Botón "Filtrar"
  │  └─ Botón "Limpiar"
  ├─ <ActiveFiltersBar>
  │  ├─ Mostrar filtros activos como "chips"
  │  ├─ Botón X para remover filtro individual
  │  └─ Botón "Limpiar todo"
  ├─ <RestaurantList>
  │  ├─ <RestaurantTableRow /> (vista alternativa a grid)
  │  │  ├─ Nombre | Cocina | Rating | Ubicación | Acción
  │  │  └─ Hover: mostrar botones "Ver", "Reservar"
  │  ├─ O <RestaurantGridView />
  │  │  └─ Grid estándar (como en home)
  │  └─ <ViewToggle /> (Grid <> List view)
  ├─ <Pagination>
  │  ├─ Botones prev/next
  │  ├─ Números de página
  │  ├─ Selector "Items por página"
  │  └─ Info: "Mostrando X-Y de Z"
  └─ <Footer />
```

### **Estados**

#### **Estado: Loading**
```
Trigger: Carga inicial, cambio de página, aplicar filtros

UI:
- Skeleton loaders en tabla/grid
- Spinner en filtros
- Deshabilitar paginación
- Mensaje opcional: "Filtrando restaurantes..."
```

#### **Estado: Success**
```
Condición: data.length > 0

UI:
- Mostrar listado completo
- Paginación activa
- Contador actualizado
- Filtros activos resaltados
```

#### **Estado: Empty**
```
Condición: data.length === 0 después de filtros

UI:
- Mensaje: "No hay restaurantes que coincidan con los filtros"
- Sugerencias de filtros alternativos
- Botón "Ver todos sin filtros"
```

#### **Estado: Error**
```
Misma lógica que en HOME (/)
- Error de conexión → "Reintentar"
- Error servidor → "Contacta soporte"
- Fallback: Mostrar último listado en caché (si disponible)
```

### **Flujo de Navegación**
```
RESTAURANTS (/restaurants):
├─ Click en restaurante → /restaurants/[id]
├─ Cambiar filtros → query params actualizados
├─ Paginar → página actualizada
└─ Back → Mantener estado de filtros/página (state restoration)
```

### **Query Parameters Soportados**
```
GET /restaurants?search=pizza&cuisine=italian&rating=4&page=2&limit=20&sort=rating

Parámetros:
- search: búsqueda por texto
- cuisine: tipo de cocina
- rating: rating mínimo (1-5)
- page: página actual
- limit: items por página (10, 20, 50)
- sort: rating, name, newest
```

### **Validación de Parámetros**
```
- page: min 1, max totalPages
- limit: valores permitidos: 10, 20, 50 (default: 20)
- rating: 1-5 (default: sin filtro)
- sort: 'rating', 'name', 'newest' (default: 'rating')
- search: máx 100 caracteres

Si parámetro inválido → usar default y mostrar notificación
```

---

## Ruta: `/restaurants/[id]` (Detalle del Restaurante)

### **Propósito**
Landing page específica de un restaurante. Presenta toda la información, menú, reseñas, disponibilidad de reservas. Centro de conversión (bookings).

### **Tipo de Ruta**
- **Pública**, sin autenticación
- **Dinámica**: `[id]` puede ser UUID o slug
- **Pre-renderizada** (SSG) con ISR para actualizar datos
- **Alto SEO**: Título, descripción, imagen de og:tags dinámicos

### **Datos Consumidos**

#### Llamadas API Principales (Obligatorias)
```
GET /restaurants/{id}
├─ Datos principales del restaurante
├─ Retorna:
│  ├─ id, name, description
│  ├─ imageUrl, cuisine
│  ├─ address, phone, email, website
│  ├─ schedule (horarios)
│  ├─ location (lat, lng)
│  ├─ capacity, tables
│  ├─ averageRating, totalReviews
│  └─ metadata (establecido en, awards, etc.)
└─ Timeout: 5s, con fallback a datos cacheados

GET /restaurants/{id}/menus
├─ Estructura de menús (categorías)
├─ Retorna array de categorías
│  ├─ id, name, description
│  ├─ imageUrl, displayOrder
│  └─ products (items anidados) [opcional]
└─ Cache: 1 hora

GET /restaurants/{id}/menu-items
├─ Todos los items del menú (desglosados)
├─ Retorna:
│  ├─ id, name, description
│  ├─ price, imageUrl
│  ├─ category, isAvailable
│  ├─ allergens, dietary (tags)
│  └─ displayOrder
└─ Cache: 30 minutos

GET /reviews?restaurantId={id}&page=1&limit=10
├─ Reseñas del restaurante (paginadas)
├─ Retorna:
│  ├─ id, customerId, rating (1-5)
│  ├─ title, comment, createdAt
│  ├─ response (respuesta del restaurante)
│  ├─ helpful (votos útiles)
│  └─ pagination metadata
└─ Cache: 5 minutos
```

#### Llamadas API Secundarias (Condicionales)
```
GET /restaurants/{id}/bookings/availability?date={YYYY-MM-DD}&partySize={n}
├─ Obtener disponibilidad de mesas
├─ Trigger: Usuario intenta hacer reserva
├─ Retorna:
│  ├─ availableTables: Array de mesas
│  ├─ timeSlots: Horas disponibles
│  └─ nextAvailableDate (si no hay disponibilidad hoy)
└─ Timeout: 3s (crítico para UX)

POST /restaurants/{id}/bookings (al confirmar reserva)
├─ Crear nueva reserva
├─ Body: { date, time, partySize, customerId, notes, tableId }
├─ Retorna: { id, confirmationCode, status, createdAt }
└─ Manejo de errores: mostrar motivo de fallo
```

### **Componentes Principales**

```
<RestaurantDetailPage>
  ├─ <Header />
  ├─ <HeroSection>
  │  ├─ Imagen de portada (full-width)
  │  ├─ Nombre del restaurante (overlay)
  │  ├─ Rating badge
  │  └─ CTA: "Reservar Mesa" (sticky, siempre visible)
  ├─ <InfoBar>
  │  ├─ Dirección (con link a Google Maps)
  │  ├─ Teléfono (tel: link)
  │  ├─ Email (mailto: link)
  │  ├─ Horarios (Abierto/Cerrado + desglose)
  │  └─ Redes sociales (links)
  ├─ <DescriptionSection>
  │  ├─ Descripción completa
  │  ├─ Historia / About
  │  └─ Amenidades (WiFi, Estacionamiento, etc.)
  ├─ <MenuSection>
  │  ├─ Tabs / Acordeones por categoría
  │  ├─ <MenuCategory />
  │  │  ├─ Nombre de categoría
  │  │  ├─ Descripción
  │  │  └─ <MenuItemCard /> (x N)
  │  │     ├─ Nombre, descripción, precio
  │  │     ├─ Imagen thumbnail
  │  │     ├─ Tags (vegetariano, picante, sin gluten)
  │  │     ├─ Disponibilidad (gris si no disponible)
  │  │     └─ Botón "+" (carrito futuro)
  │  └─ Nota: "Última actualización: {fecha}"
  ├─ <ReservationSection> (sticky o modal)
  │  ├─ <ReservationForm>
  │  │  ├─ Fecha (date picker, solo fechas futuras)
  │  │  ├─ Hora (select con slots disponibles)
  │  │  ├─ Cantidad de personas (number input, 1-{capacity})
  │  │  ├─ Tipo de mesa (si aplica)
  │  │  ├─ Nombre (text input)
  │  │  ├─ Email (email input)
  │  │  ├─ Teléfono (tel input)
  │  │  ├─ Notas especiales (textarea, opcional)
  │  │  ├─ Checkbox "He leído términos"
  │  │  └─ Botón "Confirmar Reserva" (submit)
  │  └─ Validación en tiempo real + error messages
  ├─ <ReviewsSection>
  │  ├─ Rating promedio (grande)
  │  ├─ Distribución de estrellas (gráfico)
  │  ├─ Botón "Escribir reseña" (link a formulario)
  │  ├─ <ReviewList>
  │  │  ├─ <ReviewCard /> (x 5-10)
  │  │  │  ├─ Avatar + nombre del reviewer
  │  │  │  ├─ Rating (estrellas)
  │  │  │  ├─ Fecha
  │  │  │  ├─ Texto de reseña
  │  │  │  ├─ Respuesta del restaurante (si existe)
  │  │  │  ├─ Botones "Útil / No útil"
  │  │  │  └─ Link "Ver más reseñas"
  │  │  └─ <Pagination> (si > 10 reseñas)
  │  └─ "Ver todas las reseñas" link
  ├─ <MapSection>
  │  ├─ Mapa embebido (Google Maps / Leaflet)
  │  ├─ Marcador de ubicación
  │  ├─ Info popup con dirección
  │  └─ Botón "Abrir en Google Maps"
  ├─ <ContactSection>
  │  ├─ Email (con validación)
  │  ├─ Teléfono
  │  ├─ Dirección completa
  │  └─ Redes sociales
  └─ <Footer />
```

### **Estados**

#### **Estado: Loading (Carga Inicial)**
```
Trigger: Al abrir la página

UI:
- Hero: skeleton de imagen
- Info bar: skeleton
- Menú: accordion skeletons
- Reservas: form skeleton
- Reseñas: card skeletons

Componente: <PageLoadingSkeleton />
Duration: máx 3 segundos (timeout de API)
```

#### **Estado: Loading (Datos Parciales)**
```
Caso: Algunos datos cargaron, otros pendientes (ej: menú lento)

UI:
- Mostrar datos cargados (header, info, reservas)
- Spinner en sección pendiente
- Mensaje: "Cargando menú..." en esa sección
```

#### **Estado: Success (Completamente Cargado)**
```
Condición: Todas las llamadas API exitosas

UI:
- Renderizar página completa
- Habilitar formulario de reservas
- Mostrar reseñas
- Interactividad total

Interacciones activas:
- Click en menú → expandir detalles
- Cambiar fecha/hora en reserva → validar disponibilidad
- Scroll → sticky reservation widget
- Click en CTA → scroll a sección o abrir modal
```

#### **Estado: Error Parcial**
```
Casos específicos:

1. Menú no cargó:
   - Mostrar: "No pudimos cargar el menú"
   - Botón: "Reintentar"
   - No ocultar la página, solo esa sección

2. Reseñas no cargaron:
   - Mostrar: "No disponibles en este momento"
   - No afecta reservas

3. Disponibilidad no cargó:
   - Mostrar: "Comprueba la disponibilidad manualmente"
   - Botón: "Reintentar"
   - Deshabilitar formulario de reserva hasta que cargue

4. Restaurante no existe (404):
   - Mostrar: "Restaurante no encontrado"
   - Botón: "Volver a Home"
   - Redirigir a / después de 5 segundos
```

#### **Estado: Error Total (500, Network)**
```
UI:
- Full-page error message
- Botón "Reintentar"
- Botón "Contactar soporte"
- Link "Volver a Home"

Retry logic: auto-retry 1x después de 3 segundos
```

#### **Estado: Cerrado**
```
Condición: `schedule` indica horario cerrado

UI:
- Mostrar banner: "Restaurante cerrado"
- Mostrar próximo horario de apertura
- Permitir seleccionar fecha futura en reserva
- Desactivar horarios no disponibles en date picker
```

#### **Estado: Sin Disponibilidad**
```
Condición: GET /availability retorna `availableTables: []`

UI:
- Mostrar: "No hay mesas disponibles para esta fecha/hora"
- Sugerir: "Intenta con otra hora o fecha"
- Input: "Próxima fecha disponible: {date}"
- Botón: "Ver disponibilidad"
```

### **Flujo de Navegación**
```
DETAIL (/restaurants/[id]):
├─ Click en otra sección (Menú, Reservas, Reseñas) → scroll/hash (#menu, #reserve, #reviews)
├─ Click "Escribir reseña" → /restaurants/[id]/reviews/new (future)
├─ Click "Ver todas las reseñas" → /restaurants/[id]/reviews (future)
├─ Click "Reservar" → scroll a form + focus en fecha
├─ Confirmar reserva → modal de confirmación + email
├─ Back → volver a /restaurants o /
└─ Share → social media con og:tags dinámicos
```

### **Query Parameters / Hash Soportados**
```
GET /restaurants/[id]?tab=menu
├─ Parámetro: tab
├─ Valores: menu, reviews, map, contact
└─ Default: overview

GET /restaurants/[id]#reserve
├─ Hash navigation
├─ Scroll automático a sección
└─ Acepta: #menu, #reviews, #reserve, #map

GET /restaurants/[id]?reviewPage=2
├─ Para paginación de reseñas
```

### **SEO y OG Tags Dinámicos**
```
<Head>
  <title>{name} - Restaurante | E4</title>
  <meta name="description" content={description.slice(0, 160)} />
  <meta property="og:title" content={name} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href={url} />
</Head>
```

### **Validaciones en Cliente**

#### Formulario de Reserva:
```
- Fecha: no en pasado, dentro de horarios disponibles
- Hora: dentro de rango de operación
- Cantidad: 1 ≤ partySize ≤ capacity
- Nombre: min 2 caracteres
- Email: formato válido
- Teléfono: formato válido (E.164)
```

### **Caché y Revalidación**
```
- Datos del restaurante: ISR 30 minutos
- Menú: ISR 1 hora
- Reseñas: caché cliente 5 minutos + ISR 10 minutos
- Disponibilidad: NO cachear (siempre fresco)
- Borrar caché al crear reserva (optimistic update)
```

### **Performance Targets**
```
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

Optimizaciones:
- Lazy load menú y reseñas
- Progressive image loading (blur placeholder)
- Debounce en búsqueda de disponibilidad (300ms)
- Pre-load siguiente página de reseñas
```

---

## Componentes Compartidos (Reutilizables)

```
Atoms:
- <Button /> (variants: primary, secondary, ghost)
- <Input /> (text, email, tel, number, date)
- <Select /> (dropdown)
- <Checkbox />
- <Rating /> (estrellas 1-5)
- <Badge /> (cuisina, tags, disponibilidad)
- <Alert /> (error, success, warning, info)

Molecules:
- <SearchBar /> (search + filtros)
- <Pagination /> (navegación)
- <FilterChip /> (filtros activos)
- <LoadingSpinner /> / <SkeletonLoader />
- <EmptyState /> (ilustración + mensaje)
- <ErrorBoundary /> (manejo de errores)
- <Modal /> (confirmaciones, reserva)
- <Toast /> (notificaciones)

Organisms:
- <Header />
- <Footer />
- <MapSection />
- <ReviewList />
- <MenuSection />
- <ReservationForm />
- <RestaurantCard />
- <RestaurantDetail />
```

---

## Flujo de Estados Globales (State Management)

```
Propuesta: Zustand / Context API

Stores:
1. RestaurantStore
   ├─ currentRestaurant: object
   ├─ restaurants: array
   ├─ loading: boolean
   ├─ error: string | null
   └─ Actions: fetchRestaurant, searchRestaurants, clearError

2. ReservationStore
   ├─ formData: { date, time, partySize, name, email, phone }
   ├─ availableTables: array
   ├─ availableSlots: array
   ├─ loading: boolean
   ├─ success: boolean
   ├─ confirmationCode: string
   └─ Actions: updateForm, checkAvailability, submitReservation

3. UIStore
   ├─ sidebarOpen: boolean
   ├─ modalOpen: boolean
   ├─ activeTab: string
   ├─ language: 'es' | 'en'
   └─ Actions: toggleSidebar, openModal, setTab
```

---

## Testing Strategy

```
Unit Tests:
- Componentes (Atoms, Molecules)
- Validaciones de formulario
- Parseadores de datos

Integration Tests:
- Flujo de navegación (home → detail → reserva)
- Carga de datos
- Estados de error

E2E Tests:
- Buscar restaurante (home → detail)
- Hacer reserva (formulario completo)
- Cambiar filtros (paginación, búsqueda)
- Dejar reseña (futura)

Tools:
- Jest (unit)
- React Testing Library (components)
- Cypress (E2E)
```

---

## Próximos Pasos

1. Crear componentes base (Atoms)
2. Implementar pages (/, /restaurants, /restaurants/[id])
3. Integración de API (cliente HTTP setup)
4. State management (Zustand setup)
5. Styling (Tailwind / CSS modules)
6. Testing (unit + E2E)
7. Optimización y deploy

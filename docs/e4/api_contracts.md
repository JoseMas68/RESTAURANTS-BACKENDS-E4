# Contratos API REST - Sistema de Restaurantes

## 1. Información General

### 1.1 Base URL

```
Production: https://api.restaurants.com/v1
Development: http://localhost:3000/v1
```

### 1.2 Convenciones

| Aspecto | Convención |
|---------|------------|
| Formato | JSON (application/json) |
| Autenticación | Bearer Token (JWT) |
| Fechas | ISO 8601 (`2024-01-15T10:30:00Z`) |
| IDs | UUID v4 |
| Paginación | Cursor-based o offset-based |
| Versionado | URL path (`/v1/`) |

### 1.3 Headers Comunes

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>
X-Request-ID: <uuid>
Accept-Language: es-MX
```

### 1.4 Estructura de Respuesta Estándar

**Respuesta Exitosa (Objeto)**
```json
{
  "success": true,
  "data": { },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Respuesta Exitosa (Lista Paginada)**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Respuesta de Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos proporcionados no son válidos",
    "details": [
      {
        "field": "email",
        "message": "El formato del email es inválido"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 1.5 Códigos de Error

| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Datos de entrada inválidos |
| `UNAUTHORIZED` | 401 | Token no proporcionado o inválido |
| `FORBIDDEN` | 403 | Sin permisos para esta acción |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `CONFLICT` | 409 | Conflicto (ej: email duplicado) |
| `UNPROCESSABLE_ENTITY` | 422 | Entidad no procesable |
| `RATE_LIMIT_EXCEEDED` | 429 | Límite de peticiones excedido |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

---

## 2. Autenticación (`/auth`)

### 2.1 Registro de Usuario

```http
POST /auth/register
```

**Body**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+52 55 1234 5678"
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "phone": "+52 55 1234 5678",
      "role": "customer",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Datos de entrada inválidos |
| 409 | Email ya registrado |

---

### 2.2 Inicio de Sesión

```http
POST /auth/login
```

**Body**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "SecurePass123!"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "customer",
      "avatarUrl": "https://cdn.example.com/avatars/user.jpg"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Datos de entrada inválidos |
| 401 | Credenciales incorrectas |
| 403 | Cuenta desactivada |

---

### 2.3 Refrescar Token

```http
POST /auth/refresh
```

**Body**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |

---

### 2.4 Cerrar Sesión

```http
POST /auth/logout
```

**Headers**
```http
Authorization: Bearer <access_token>
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada exitosamente"
  }
}
```

---

### 2.5 Solicitar Recuperación de Contraseña

```http
POST /auth/forgot-password
```

**Body**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "message": "Si el email existe, recibirás instrucciones para restablecer tu contraseña"
  }
}
```

---

### 2.6 Restablecer Contraseña

```http
POST /auth/reset-password
```

**Body**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!",
  "passwordConfirmation": "NewSecurePass123!"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña actualizada exitosamente"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Token inválido o expirado |
| 400 | Las contraseñas no coinciden |

---

## 3. Usuarios (`/users`)

### 3.1 Obtener Perfil Actual

```http
GET /users/me
```

**Headers**
```http
Authorization: Bearer <access_token>
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+52 55 1234 5678",
    "role": "customer",
    "avatarUrl": "https://cdn.example.com/avatars/user.jpg",
    "emailVerified": true,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T15:45:00Z"
  }
}
```

---

### 3.2 Actualizar Perfil

```http
PATCH /users/me
```

**Body**
```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "phone": "+52 55 9876 5432"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@ejemplo.com",
    "firstName": "Juan Carlos",
    "lastName": "Pérez García",
    "phone": "+52 55 9876 5432",
    "role": "customer",
    "updatedAt": "2024-01-20T16:00:00Z"
  }
}
```

---

### 3.3 Cambiar Contraseña

```http
PUT /users/me/password
```

**Body**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "newPasswordConfirmation": "NewSecurePass456!"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña actualizada exitosamente"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Contraseña actual incorrecta |
| 400 | Las contraseñas no coinciden |

---

### 3.4 Subir Avatar

```http
POST /users/me/avatar
```

**Headers**
```http
Content-Type: multipart/form-data
```

**Body**
```
avatar: <file>
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.example.com/avatars/550e8400-e29b-41d4-a716-446655440000.jpg"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Formato de archivo no soportado |
| 400 | Archivo demasiado grande (max 5MB) |

---

## 4. Direcciones (`/users/me/addresses`)

### 4.1 Listar Direcciones

```http
GET /users/me/addresses
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "addr-001",
      "label": "Casa",
      "addressLine": "Av. Reforma 123, Col. Centro",
      "city": "Ciudad de México",
      "state": "CDMX",
      "postalCode": "06000",
      "country": "México",
      "latitude": 19.4326,
      "longitude": -99.1332,
      "instructions": "Edificio azul, departamento 4B",
      "isDefault": true,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "addr-002",
      "label": "Oficina",
      "addressLine": "Insurgentes Sur 1602, Piso 8",
      "city": "Ciudad de México",
      "state": "CDMX",
      "postalCode": "03940",
      "country": "México",
      "isDefault": false,
      "createdAt": "2024-01-16T09:00:00Z"
    }
  ]
}
```

---

### 4.2 Crear Dirección

```http
POST /users/me/addresses
```

**Body**
```json
{
  "label": "Casa de mamá",
  "addressLine": "Calle Hidalgo 456, Col. Roma",
  "city": "Ciudad de México",
  "state": "CDMX",
  "postalCode": "06700",
  "country": "México",
  "latitude": 19.4195,
  "longitude": -99.1626,
  "instructions": "Casa blanca con portón negro",
  "isDefault": false
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "addr-003",
    "label": "Casa de mamá",
    "addressLine": "Calle Hidalgo 456, Col. Roma",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postalCode": "06700",
    "country": "México",
    "latitude": 19.4195,
    "longitude": -99.1626,
    "instructions": "Casa blanca con portón negro",
    "isDefault": false,
    "createdAt": "2024-01-20T16:30:00Z"
  }
}
```

---

### 4.3 Actualizar Dirección

```http
PATCH /users/me/addresses/:addressId
```

**Parámetros de Ruta**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| addressId | UUID | ID de la dirección |

**Body**
```json
{
  "label": "Casa de mamá (nueva)",
  "instructions": "Tocar el timbre 2 veces"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "addr-003",
    "label": "Casa de mamá (nueva)",
    "addressLine": "Calle Hidalgo 456, Col. Roma",
    "instructions": "Tocar el timbre 2 veces",
    "updatedAt": "2024-01-20T17:00:00Z"
  }
}
```

---

### 4.4 Eliminar Dirección

```http
DELETE /users/me/addresses/:addressId
```

**Respuesta Exitosa (204 No Content)**

**Errores**
| Código | Descripción |
|--------|-------------|
| 404 | Dirección no encontrada |
| 400 | No se puede eliminar la dirección predeterminada |

---

### 4.5 Establecer Dirección Predeterminada

```http
PUT /users/me/addresses/:addressId/default
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "addr-003",
    "isDefault": true,
    "updatedAt": "2024-01-20T17:30:00Z"
  }
}
```

---

## 5. Restaurantes (`/restaurants`)

### 5.1 Listar Restaurantes

```http
GET /restaurants
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| page | integer | 1 | Número de página |
| limit | integer | 20 | Resultados por página (max 50) |
| search | string | - | Búsqueda por nombre |
| city | string | - | Filtrar por ciudad |
| rating | number | - | Rating mínimo (1-5) |
| isOpen | boolean | - | Solo restaurantes abiertos ahora |
| sortBy | string | createdAt | Campo de ordenamiento |
| sortOrder | string | desc | Orden (asc/desc) |
| lat | number | - | Latitud para ordenar por cercanía |
| lng | number | - | Longitud para ordenar por cercanía |

**Ejemplo de Request**
```http
GET /restaurants?city=CDMX&rating=4&isOpen=true&page=1&limit=10
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "rest-001",
      "name": "La Trattoria Italiana",
      "slug": "la-trattoria-italiana",
      "description": "Auténtica cocina italiana en el corazón de la ciudad",
      "phone": "+52 55 1234 5678",
      "logoUrl": "https://cdn.example.com/restaurants/trattoria-logo.jpg",
      "coverImageUrl": "https://cdn.example.com/restaurants/trattoria-cover.jpg",
      "address": {
        "addressLine": "Av. Presidente Masaryk 123",
        "city": "Ciudad de México",
        "state": "CDMX",
        "postalCode": "11560"
      },
      "location": {
        "latitude": 19.4326,
        "longitude": -99.1870
      },
      "averageRating": 4.7,
      "totalReviews": 234,
      "isOpen": true,
      "currentSchedule": {
        "openTime": "12:00",
        "closeTime": "23:00"
      },
      "distance": 1.2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 5.2 Obtener Restaurante por ID o Slug

```http
GET /restaurants/:identifier
```

**Parámetros de Ruta**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| identifier | string | ID (UUID) o slug del restaurante |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "rest-001",
    "name": "La Trattoria Italiana",
    "slug": "la-trattoria-italiana",
    "description": "Auténtica cocina italiana en el corazón de la ciudad. Más de 20 años de tradición.",
    "phone": "+52 55 1234 5678",
    "email": "contacto@latrattoria.com",
    "logoUrl": "https://cdn.example.com/restaurants/trattoria-logo.jpg",
    "coverImageUrl": "https://cdn.example.com/restaurants/trattoria-cover.jpg",
    "address": {
      "addressLine": "Av. Presidente Masaryk 123",
      "city": "Ciudad de México",
      "state": "CDMX",
      "postalCode": "11560",
      "country": "México"
    },
    "location": {
      "latitude": 19.4326,
      "longitude": -99.1870
    },
    "averageRating": 4.7,
    "totalReviews": 234,
    "isActive": true,
    "schedules": [
      { "dayOfWeek": 0, "openTime": "12:00", "closeTime": "22:00", "isClosed": false },
      { "dayOfWeek": 1, "openTime": "12:00", "closeTime": "23:00", "isClosed": false },
      { "dayOfWeek": 2, "openTime": "12:00", "closeTime": "23:00", "isClosed": false },
      { "dayOfWeek": 3, "openTime": "12:00", "closeTime": "23:00", "isClosed": false },
      { "dayOfWeek": 4, "openTime": "12:00", "closeTime": "00:00", "isClosed": false },
      { "dayOfWeek": 5, "openTime": "12:00", "closeTime": "00:00", "isClosed": false },
      { "dayOfWeek": 6, "openTime": "13:00", "closeTime": "22:00", "isClosed": false }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 404 | Restaurante no encontrado |

---

### 5.3 Crear Restaurante (Admin/Manager)

```http
POST /restaurants
```

**Body**
```json
{
  "name": "Sushi Master",
  "description": "Los mejores rolls de la ciudad",
  "phone": "+52 55 9876 5432",
  "email": "info@sushimaster.com",
  "addressLine": "Av. Insurgentes Sur 1234",
  "city": "Ciudad de México",
  "state": "CDMX",
  "postalCode": "03100",
  "country": "México",
  "latitude": 19.3910,
  "longitude": -99.1784,
  "schedules": [
    { "dayOfWeek": 0, "openTime": "13:00", "closeTime": "22:00" },
    { "dayOfWeek": 1, "openTime": "12:00", "closeTime": "23:00" },
    { "dayOfWeek": 2, "openTime": "12:00", "closeTime": "23:00" },
    { "dayOfWeek": 3, "openTime": "12:00", "closeTime": "23:00" },
    { "dayOfWeek": 4, "openTime": "12:00", "closeTime": "23:00" },
    { "dayOfWeek": 5, "openTime": "12:00", "closeTime": "00:00" },
    { "dayOfWeek": 6, "openTime": "12:00", "closeTime": "00:00" }
  ]
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "rest-002",
    "name": "Sushi Master",
    "slug": "sushi-master",
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-20T18:00:00Z"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Datos de entrada inválidos |
| 403 | Sin permisos para crear restaurantes |
| 409 | Ya existe un restaurante con ese nombre |

---

### 5.4 Actualizar Restaurante

```http
PATCH /restaurants/:restaurantId
```

**Body**
```json
{
  "description": "Los mejores rolls y sashimi de la ciudad",
  "phone": "+52 55 1111 2222"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "rest-002",
    "name": "Sushi Master",
    "description": "Los mejores rolls y sashimi de la ciudad",
    "phone": "+52 55 1111 2222",
    "updatedAt": "2024-01-20T19:00:00Z"
  }
}
```

---

### 5.5 Subir Logo/Cover del Restaurante

```http
POST /restaurants/:restaurantId/images
```

**Headers**
```http
Content-Type: multipart/form-data
```

**Body**
```
type: logo | cover
image: <file>
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://cdn.example.com/restaurants/sushi-master-logo.jpg",
    "type": "logo"
  }
}
```

---

## 6. Categorías (`/restaurants/:restaurantId/categories`)

### 6.1 Listar Categorías

```http
GET /restaurants/:restaurantId/categories
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| includeProducts | boolean | false | Incluir productos de cada categoría |
| activeOnly | boolean | true | Solo categorías activas |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-001",
      "name": "Entradas",
      "slug": "entradas",
      "description": "Para comenzar tu experiencia",
      "imageUrl": "https://cdn.example.com/categories/entradas.jpg",
      "displayOrder": 1,
      "isActive": true,
      "productCount": 8
    },
    {
      "id": "cat-002",
      "name": "Platos Fuertes",
      "slug": "platos-fuertes",
      "description": "Nuestras especialidades",
      "imageUrl": "https://cdn.example.com/categories/platos-fuertes.jpg",
      "displayOrder": 2,
      "isActive": true,
      "productCount": 15
    },
    {
      "id": "cat-003",
      "name": "Postres",
      "slug": "postres",
      "description": "Dulces tentaciones",
      "displayOrder": 3,
      "isActive": true,
      "productCount": 6
    }
  ]
}
```

---

### 6.2 Crear Categoría

```http
POST /restaurants/:restaurantId/categories
```

**Body**
```json
{
  "name": "Bebidas",
  "description": "Refrescos, jugos y bebidas calientes",
  "displayOrder": 4
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "cat-004",
    "name": "Bebidas",
    "slug": "bebidas",
    "description": "Refrescos, jugos y bebidas calientes",
    "displayOrder": 4,
    "isActive": true,
    "createdAt": "2024-01-20T20:00:00Z"
  }
}
```

---

### 6.3 Actualizar Categoría

```http
PATCH /restaurants/:restaurantId/categories/:categoryId
```

**Body**
```json
{
  "name": "Bebidas y Cócteles",
  "displayOrder": 5
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "cat-004",
    "name": "Bebidas y Cócteles",
    "slug": "bebidas-y-cocteles",
    "displayOrder": 5,
    "updatedAt": "2024-01-20T21:00:00Z"
  }
}
```

---

### 6.4 Eliminar Categoría

```http
DELETE /restaurants/:restaurantId/categories/:categoryId
```

**Respuesta Exitosa (204 No Content)**

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | La categoría tiene productos asociados |
| 404 | Categoría no encontrada |

---

### 6.5 Reordenar Categorías

```http
PUT /restaurants/:restaurantId/categories/reorder
```

**Body**
```json
{
  "orderedIds": [
    "cat-001",
    "cat-003",
    "cat-002",
    "cat-004"
  ]
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "message": "Categorías reordenadas exitosamente"
  }
}
```

---

## 7. Productos (`/restaurants/:restaurantId/products`)

### 7.1 Listar Productos

```http
GET /restaurants/:restaurantId/products
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| page | integer | 1 | Número de página |
| limit | integer | 20 | Resultados por página |
| categoryId | UUID | - | Filtrar por categoría |
| search | string | - | Buscar por nombre |
| isAvailable | boolean | - | Filtrar por disponibilidad |
| isFeatured | boolean | - | Solo productos destacados |
| isVegetarian | boolean | - | Solo vegetarianos |
| isVegan | boolean | - | Solo veganos |
| isGlutenFree | boolean | - | Solo sin gluten |
| minPrice | number | - | Precio mínimo |
| maxPrice | number | - | Precio máximo |
| sortBy | string | displayOrder | Campo de ordenamiento |
| sortOrder | string | asc | Orden (asc/desc) |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod-001",
      "name": "Bruschetta Clásica",
      "slug": "bruschetta-clasica",
      "description": "Pan tostado con tomate fresco, albahaca y aceite de oliva",
      "price": 120.00,
      "discountPrice": null,
      "imageUrl": "https://cdn.example.com/products/bruschetta.jpg",
      "preparationTime": 10,
      "calories": 180,
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false,
      "isFeatured": true,
      "isAvailable": true,
      "category": {
        "id": "cat-001",
        "name": "Entradas",
        "slug": "entradas"
      }
    },
    {
      "id": "prod-002",
      "name": "Pasta Carbonara",
      "slug": "pasta-carbonara",
      "description": "Spaghetti con huevo, queso pecorino, guanciale y pimienta negra",
      "price": 220.00,
      "discountPrice": 189.00,
      "imageUrl": "https://cdn.example.com/products/carbonara.jpg",
      "preparationTime": 20,
      "calories": 650,
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false,
      "isFeatured": true,
      "isAvailable": true,
      "category": {
        "id": "cat-002",
        "name": "Platos Fuertes",
        "slug": "platos-fuertes"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 29,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 7.2 Obtener Menú Completo (Agrupado por Categorías)

```http
GET /restaurants/:restaurantId/menu
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| availableOnly | boolean | true | Solo productos disponibles |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "rest-001",
      "name": "La Trattoria Italiana"
    },
    "categories": [
      {
        "id": "cat-001",
        "name": "Entradas",
        "slug": "entradas",
        "products": [
          {
            "id": "prod-001",
            "name": "Bruschetta Clásica",
            "price": 120.00,
            "imageUrl": "https://cdn.example.com/products/bruschetta.jpg",
            "isVegetarian": true
          }
        ]
      },
      {
        "id": "cat-002",
        "name": "Platos Fuertes",
        "slug": "platos-fuertes",
        "products": [
          {
            "id": "prod-002",
            "name": "Pasta Carbonara",
            "price": 220.00,
            "discountPrice": 189.00,
            "imageUrl": "https://cdn.example.com/products/carbonara.jpg"
          }
        ]
      }
    ]
  }
}
```

---

### 7.3 Obtener Producto por ID

```http
GET /restaurants/:restaurantId/products/:productId
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "prod-002",
    "name": "Pasta Carbonara",
    "slug": "pasta-carbonara",
    "description": "Spaghetti con huevo, queso pecorino, guanciale y pimienta negra. Receta tradicional romana.",
    "price": 220.00,
    "discountPrice": 189.00,
    "imageUrl": "https://cdn.example.com/products/carbonara.jpg",
    "preparationTime": 20,
    "calories": 650,
    "isVegetarian": false,
    "isVegan": false,
    "isGlutenFree": false,
    "isFeatured": true,
    "isAvailable": true,
    "displayOrder": 1,
    "category": {
      "id": "cat-002",
      "name": "Platos Fuertes",
      "slug": "platos-fuertes"
    },
    "restaurant": {
      "id": "rest-001",
      "name": "La Trattoria Italiana"
    },
    "createdAt": "2024-01-05T10:00:00Z",
    "updatedAt": "2024-01-18T14:30:00Z"
  }
}
```

---

### 7.4 Crear Producto

```http
POST /restaurants/:restaurantId/products
```

**Body**
```json
{
  "categoryId": "cat-002",
  "name": "Risotto ai Funghi",
  "description": "Arroz arborio cremoso con mix de hongos silvestres y parmesano",
  "price": 245.00,
  "preparationTime": 25,
  "calories": 520,
  "isVegetarian": true,
  "isVegan": false,
  "isGlutenFree": true,
  "isFeatured": false
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "prod-003",
    "name": "Risotto ai Funghi",
    "slug": "risotto-ai-funghi",
    "categoryId": "cat-002",
    "price": 245.00,
    "isAvailable": true,
    "createdAt": "2024-01-20T22:00:00Z"
  }
}
```

---

### 7.5 Actualizar Producto

```http
PATCH /restaurants/:restaurantId/products/:productId
```

**Body**
```json
{
  "price": 259.00,
  "discountPrice": 229.00,
  "isFeatured": true
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "prod-003",
    "price": 259.00,
    "discountPrice": 229.00,
    "isFeatured": true,
    "updatedAt": "2024-01-20T23:00:00Z"
  }
}
```

---

### 7.6 Subir Imagen del Producto

```http
POST /restaurants/:restaurantId/products/:productId/image
```

**Headers**
```http
Content-Type: multipart/form-data
```

**Body**
```
image: <file>
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://cdn.example.com/products/risotto.jpg"
  }
}
```

---

### 7.7 Cambiar Disponibilidad del Producto

```http
PATCH /restaurants/:restaurantId/products/:productId/availability
```

**Body**
```json
{
  "isAvailable": false
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "prod-003",
    "isAvailable": false,
    "updatedAt": "2024-01-21T08:00:00Z"
  }
}
```

---

### 7.8 Eliminar Producto

```http
DELETE /restaurants/:restaurantId/products/:productId
```

**Respuesta Exitosa (204 No Content)**

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Producto tiene pedidos activos asociados |
| 404 | Producto no encontrado |

---

## 8. Mesas (`/restaurants/:restaurantId/tables`)

### 8.1 Listar Mesas

```http
GET /restaurants/:restaurantId/tables
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| isAvailable | boolean | - | Filtrar por disponibilidad |
| minCapacity | integer | - | Capacidad mínima |
| location | string | - | Ubicación (terraza, interior, etc.) |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "table-001",
      "tableNumber": "1",
      "capacity": 4,
      "location": "interior",
      "isAvailable": true
    },
    {
      "id": "table-002",
      "tableNumber": "2",
      "capacity": 2,
      "location": "terraza",
      "isAvailable": false
    },
    {
      "id": "table-003",
      "tableNumber": "3",
      "capacity": 6,
      "location": "privado",
      "isAvailable": true
    }
  ]
}
```

---

### 8.2 Crear Mesa

```http
POST /restaurants/:restaurantId/tables
```

**Body**
```json
{
  "tableNumber": "4",
  "capacity": 8,
  "location": "privado"
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "table-004",
    "tableNumber": "4",
    "capacity": 8,
    "location": "privado",
    "isAvailable": true,
    "createdAt": "2024-01-21T09:00:00Z"
  }
}
```

---

### 8.3 Actualizar Mesa

```http
PATCH /restaurants/:restaurantId/tables/:tableId
```

**Body**
```json
{
  "capacity": 10,
  "isAvailable": false
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "table-004",
    "capacity": 10,
    "isAvailable": false,
    "updatedAt": "2024-01-21T10:00:00Z"
  }
}
```

---

### 8.4 Eliminar Mesa

```http
DELETE /restaurants/:restaurantId/tables/:tableId
```

**Respuesta Exitosa (204 No Content)**

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Mesa tiene reservaciones activas |
| 404 | Mesa no encontrada |

---

## 9. Pedidos (`/orders`)

### 9.1 Listar Pedidos del Usuario

```http
GET /orders
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| page | integer | 1 | Número de página |
| limit | integer | 20 | Resultados por página |
| status | string | - | Filtrar por estado |
| restaurantId | UUID | - | Filtrar por restaurante |
| fromDate | date | - | Fecha inicial |
| toDate | date | - | Fecha final |
| sortBy | string | createdAt | Campo de ordenamiento |
| sortOrder | string | desc | Orden (asc/desc) |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-001",
      "orderNumber": "ORD-20240120-000001",
      "status": "delivered",
      "orderType": "delivery",
      "total": 489.00,
      "paymentStatus": "paid",
      "restaurant": {
        "id": "rest-001",
        "name": "La Trattoria Italiana",
        "logoUrl": "https://cdn.example.com/restaurants/trattoria-logo.jpg"
      },
      "itemCount": 3,
      "createdAt": "2024-01-20T19:30:00Z",
      "deliveredAt": "2024-01-20T20:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### 9.2 Obtener Pedido por ID

```http
GET /orders/:orderId
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "order-001",
    "orderNumber": "ORD-20240120-000001",
    "status": "delivered",
    "orderType": "delivery",
    "subtotal": 409.00,
    "tax": 65.44,
    "deliveryFee": 35.00,
    "discount": 20.44,
    "total": 489.00,
    "paymentMethod": "card",
    "paymentStatus": "paid",
    "notes": "Sin cebolla en la pasta, por favor",
    "estimatedTime": 45,
    "restaurant": {
      "id": "rest-001",
      "name": "La Trattoria Italiana",
      "phone": "+52 55 1234 5678",
      "address": "Av. Presidente Masaryk 123"
    },
    "deliveryAddress": {
      "addressLine": "Av. Reforma 123, Col. Centro",
      "city": "Ciudad de México",
      "instructions": "Edificio azul, departamento 4B"
    },
    "items": [
      {
        "id": "item-001",
        "productId": "prod-001",
        "productName": "Bruschetta Clásica",
        "quantity": 1,
        "unitPrice": 120.00,
        "subtotal": 120.00,
        "notes": null
      },
      {
        "id": "item-002",
        "productId": "prod-002",
        "productName": "Pasta Carbonara",
        "quantity": 2,
        "unitPrice": 189.00,
        "subtotal": 378.00,
        "notes": "Sin cebolla"
      }
    ],
    "timeline": {
      "createdAt": "2024-01-20T19:30:00Z",
      "confirmedAt": "2024-01-20T19:32:00Z",
      "preparedAt": "2024-01-20T19:55:00Z",
      "deliveredAt": "2024-01-20T20:15:00Z"
    }
  }
}
```

---

### 9.3 Crear Pedido

```http
POST /orders
```

**Body**
```json
{
  "restaurantId": "rest-001",
  "orderType": "delivery",
  "addressId": "addr-001",
  "paymentMethod": "card",
  "notes": "Sin cebolla en la pasta, por favor",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 1
    },
    {
      "productId": "prod-002",
      "quantity": 2,
      "notes": "Sin cebolla"
    }
  ]
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "order-002",
    "orderNumber": "ORD-20240121-000001",
    "status": "pending",
    "orderType": "delivery",
    "subtotal": 498.00,
    "tax": 79.68,
    "deliveryFee": 35.00,
    "discount": 0,
    "total": 612.68,
    "paymentStatus": "pending",
    "estimatedTime": 45,
    "items": [
      {
        "productId": "prod-001",
        "productName": "Bruschetta Clásica",
        "quantity": 1,
        "unitPrice": 120.00,
        "subtotal": 120.00
      },
      {
        "productId": "prod-002",
        "productName": "Pasta Carbonara",
        "quantity": 2,
        "unitPrice": 189.00,
        "subtotal": 378.00
      }
    ],
    "createdAt": "2024-01-21T12:00:00Z"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Datos inválidos o productos no disponibles |
| 400 | Restaurante cerrado |
| 400 | Dirección requerida para delivery |

---

### 9.4 Crear Pedido en Mesa (Dine-in)

```http
POST /orders
```

**Body**
```json
{
  "restaurantId": "rest-001",
  "orderType": "dine_in",
  "tableId": "table-003",
  "items": [
    {
      "productId": "prod-003",
      "quantity": 2
    }
  ]
}
```

---

### 9.5 Cancelar Pedido

```http
POST /orders/:orderId/cancel
```

**Body**
```json
{
  "reason": "Tiempo de espera muy largo"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "order-002",
    "status": "cancelled",
    "cancellationReason": "Tiempo de espera muy largo",
    "cancelledAt": "2024-01-21T12:15:00Z"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | El pedido no puede ser cancelado (ya preparado/entregado) |
| 404 | Pedido no encontrado |

---

### 9.6 Seguimiento en Tiempo Real

```http
GET /orders/:orderId/tracking
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "orderId": "order-002",
    "orderNumber": "ORD-20240121-000001",
    "status": "preparing",
    "estimatedDeliveryTime": "2024-01-21T12:45:00Z",
    "currentStep": 2,
    "steps": [
      {
        "step": 1,
        "name": "Pedido recibido",
        "status": "completed",
        "completedAt": "2024-01-21T12:00:00Z"
      },
      {
        "step": 2,
        "name": "Preparando",
        "status": "in_progress",
        "startedAt": "2024-01-21T12:05:00Z"
      },
      {
        "step": 3,
        "name": "Listo para entrega",
        "status": "pending"
      },
      {
        "step": 4,
        "name": "En camino",
        "status": "pending"
      },
      {
        "step": 5,
        "name": "Entregado",
        "status": "pending"
      }
    ]
  }
}
```

---

## 10. Gestión de Pedidos - Restaurante (`/restaurants/:restaurantId/orders`)

### 10.1 Listar Pedidos del Restaurante

```http
GET /restaurants/:restaurantId/orders
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| page | integer | 1 | Página |
| limit | integer | 20 | Límite |
| status | string | - | Estado del pedido |
| orderType | string | - | Tipo (dine_in, takeout, delivery) |
| fromDate | date | - | Fecha inicial |
| toDate | date | - | Fecha final |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-002",
      "orderNumber": "ORD-20240121-000001",
      "status": "pending",
      "orderType": "delivery",
      "total": 612.68,
      "customer": {
        "id": "user-001",
        "firstName": "Juan",
        "lastName": "Pérez",
        "phone": "+52 55 1234 5678"
      },
      "itemCount": 3,
      "createdAt": "2024-01-21T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8
  }
}
```

---

### 10.2 Actualizar Estado del Pedido

```http
PATCH /restaurants/:restaurantId/orders/:orderId/status
```

**Body**
```json
{
  "status": "confirmed",
  "estimatedTime": 40
}
```

**Estados Válidos y Transiciones**
| Estado Actual | Estados Permitidos |
|---------------|-------------------|
| pending | confirmed, cancelled |
| confirmed | preparing, cancelled |
| preparing | ready |
| ready | on_the_way (delivery), completed (dine_in/takeout) |
| on_the_way | delivered |
| delivered | completed |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "order-002",
    "status": "confirmed",
    "estimatedTime": 40,
    "confirmedAt": "2024-01-21T12:05:00Z",
    "updatedAt": "2024-01-21T12:05:00Z"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Transición de estado no permitida |

---

### 10.3 Dashboard de Pedidos en Tiempo Real

```http
GET /restaurants/:restaurantId/orders/dashboard
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "summary": {
      "pending": 3,
      "confirmed": 2,
      "preparing": 5,
      "ready": 1,
      "onTheWay": 2,
      "todayTotal": 45,
      "todayRevenue": 28500.00
    },
    "activeOrders": [
      {
        "id": "order-002",
        "orderNumber": "ORD-20240121-000001",
        "status": "preparing",
        "orderType": "delivery",
        "elapsedMinutes": 15,
        "estimatedTime": 40,
        "items": [
          { "name": "Bruschetta Clásica", "quantity": 1 },
          { "name": "Pasta Carbonara", "quantity": 2 }
        ]
      }
    ]
  }
}
```

---

## 11. Reservaciones (`/reservations`)

### 11.1 Listar Reservaciones del Usuario

```http
GET /reservations
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| page | integer | 1 | Página |
| limit | integer | 20 | Límite |
| status | string | - | Estado |
| fromDate | date | - | Fecha inicial |
| upcoming | boolean | false | Solo reservaciones futuras |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "res-001",
      "reservationNumber": "RES-20240125-000001",
      "status": "confirmed",
      "partySize": 4,
      "reservationDate": "2024-01-25",
      "reservationTime": "20:00",
      "durationMinutes": 90,
      "restaurant": {
        "id": "rest-001",
        "name": "La Trattoria Italiana",
        "address": "Av. Presidente Masaryk 123",
        "phone": "+52 55 1234 5678"
      },
      "table": {
        "tableNumber": "5",
        "location": "terraza"
      },
      "createdAt": "2024-01-20T15:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3
  }
}
```

---

### 11.2 Verificar Disponibilidad

```http
GET /restaurants/:restaurantId/reservations/availability
```

**Query Parameters**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| date | date | Sí | Fecha de la reservación |
| partySize | integer | Sí | Número de personas |
| time | time | No | Hora específica (opcional) |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-25",
    "partySize": 4,
    "availableSlots": [
      {
        "time": "13:00",
        "tablesAvailable": 3
      },
      {
        "time": "13:30",
        "tablesAvailable": 2
      },
      {
        "time": "14:00",
        "tablesAvailable": 4
      },
      {
        "time": "20:00",
        "tablesAvailable": 1
      },
      {
        "time": "20:30",
        "tablesAvailable": 2
      }
    ]
  }
}
```

---

### 11.3 Crear Reservación

```http
POST /reservations
```

**Body**
```json
{
  "restaurantId": "rest-001",
  "partySize": 4,
  "reservationDate": "2024-01-25",
  "reservationTime": "20:00",
  "notes": "Celebración de cumpleaños, si es posible mesa en terraza"
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "res-002",
    "reservationNumber": "RES-20240125-000002",
    "status": "pending",
    "partySize": 4,
    "reservationDate": "2024-01-25",
    "reservationTime": "20:00",
    "durationMinutes": 90,
    "notes": "Celebración de cumpleaños, si es posible mesa en terraza",
    "restaurant": {
      "id": "rest-001",
      "name": "La Trattoria Italiana"
    },
    "createdAt": "2024-01-21T14:00:00Z"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Datos inválidos |
| 400 | No hay disponibilidad para esa fecha/hora |
| 400 | Restaurante cerrado en esa fecha |

---

### 11.4 Cancelar Reservación

```http
POST /reservations/:reservationId/cancel
```

**Body**
```json
{
  "reason": "Cambio de planes"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "res-002",
    "status": "cancelled",
    "cancellationReason": "Cambio de planes",
    "cancelledAt": "2024-01-22T10:00:00Z"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | No se puede cancelar (muy cercana a la hora) |

---

## 12. Gestión de Reservaciones - Restaurante

### 12.1 Listar Reservaciones del Restaurante

```http
GET /restaurants/:restaurantId/reservations
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| date | date | hoy | Fecha específica |
| status | string | - | Estado |
| page | integer | 1 | Página |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "res-001",
      "reservationNumber": "RES-20240125-000001",
      "status": "confirmed",
      "partySize": 4,
      "reservationTime": "20:00",
      "customer": {
        "firstName": "Juan",
        "lastName": "Pérez",
        "phone": "+52 55 1234 5678"
      },
      "table": {
        "id": "table-005",
        "tableNumber": "5"
      },
      "notes": "Celebración de cumpleaños"
    }
  ]
}
```

---

### 12.2 Confirmar Reservación

```http
POST /restaurants/:restaurantId/reservations/:reservationId/confirm
```

**Body**
```json
{
  "tableId": "table-005"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "res-001",
    "status": "confirmed",
    "table": {
      "id": "table-005",
      "tableNumber": "5",
      "location": "terraza"
    },
    "confirmedAt": "2024-01-21T15:00:00Z"
  }
}
```

---

### 12.3 Marcar como Seated/Completed/No-Show

```http
PATCH /restaurants/:restaurantId/reservations/:reservationId/status
```

**Body**
```json
{
  "status": "seated"
}
```

**Estados Válidos**
- `seated`: Cliente llegó y está sentado
- `completed`: Reservación completada
- `no_show`: Cliente no llegó

---

## 13. Reseñas (`/reviews`)

### 13.1 Listar Reseñas de un Restaurante

```http
GET /restaurants/:restaurantId/reviews
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| page | integer | 1 | Página |
| limit | integer | 20 | Límite |
| rating | integer | - | Filtrar por rating (1-5) |
| sortBy | string | createdAt | Ordenar por |
| sortOrder | string | desc | Orden |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "summary": {
      "averageRating": 4.7,
      "totalReviews": 234,
      "distribution": {
        "5": 150,
        "4": 60,
        "3": 15,
        "2": 6,
        "1": 3
      }
    },
    "reviews": [
      {
        "id": "rev-001",
        "rating": 5,
        "title": "Excelente experiencia",
        "comment": "La pasta carbonara es increíble, auténtico sabor italiano. El servicio fue impecable.",
        "isVerified": true,
        "customer": {
          "firstName": "María",
          "lastName": "G.",
          "avatarUrl": "https://cdn.example.com/avatars/maria.jpg"
        },
        "response": {
          "text": "¡Gracias por tu visita María! Nos alegra que hayas disfrutado la carbonara.",
          "respondedAt": "2024-01-19T10:00:00Z"
        },
        "createdAt": "2024-01-18T21:00:00Z"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 234
  }
}
```

---

### 13.2 Crear Reseña

```http
POST /restaurants/:restaurantId/reviews
```

**Body**
```json
{
  "orderId": "order-001",
  "rating": 5,
  "title": "Excelente experiencia",
  "comment": "La pasta carbonara es increíble, auténtico sabor italiano. El servicio fue impecable."
}
```

**Respuesta Exitosa (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "rev-002",
    "rating": 5,
    "title": "Excelente experiencia",
    "comment": "La pasta carbonara es increíble, auténtico sabor italiano. El servicio fue impecable.",
    "isVerified": true,
    "createdAt": "2024-01-21T16:00:00Z"
  }
}
```

**Errores**
| Código | Descripción |
|--------|-------------|
| 400 | Ya existe una reseña para este restaurante |
| 400 | El pedido no está completado |

---

### 13.3 Actualizar Reseña

```http
PATCH /reviews/:reviewId
```

**Body**
```json
{
  "rating": 4,
  "comment": "Actualizo mi reseña: la comida sigue siendo excelente pero el servicio ha decaído un poco."
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "rev-002",
    "rating": 4,
    "comment": "Actualizo mi reseña: la comida sigue siendo excelente pero el servicio ha decaído un poco.",
    "updatedAt": "2024-01-22T10:00:00Z"
  }
}
```

---

### 13.4 Eliminar Reseña

```http
DELETE /reviews/:reviewId
```

**Respuesta Exitosa (204 No Content)**

---

### 13.5 Responder a Reseña (Restaurante)

```http
POST /restaurants/:restaurantId/reviews/:reviewId/response
```

**Body**
```json
{
  "response": "Gracias por tu feedback. Lamentamos que la experiencia no haya sido perfecta, trabajaremos en mejorar el servicio."
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "reviewId": "rev-002",
    "response": "Gracias por tu feedback. Lamentamos que la experiencia no haya sido perfecta, trabajaremos en mejorar el servicio.",
    "responseAt": "2024-01-22T11:00:00Z"
  }
}
```

---

## 14. Administración (`/admin`)

### 14.1 Listar Usuarios (Admin)

```http
GET /admin/users
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| page | integer | 1 | Página |
| limit | integer | 20 | Límite |
| role | string | - | Filtrar por rol |
| search | string | - | Buscar por nombre/email |
| isActive | boolean | - | Filtrar por estado |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-001",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "customer",
      "isActive": true,
      "emailVerified": true,
      "ordersCount": 15,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250
  }
}
```

---

### 14.2 Actualizar Rol de Usuario

```http
PATCH /admin/users/:userId/role
```

**Body**
```json
{
  "role": "manager"
}
```

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "role": "manager",
    "updatedAt": "2024-01-22T12:00:00Z"
  }
}
```

---

### 14.3 Desactivar/Activar Usuario

```http
PATCH /admin/users/:userId/status
```

**Body**
```json
{
  "isActive": false
}
```

---

### 14.4 Dashboard General

```http
GET /admin/dashboard
```

**Query Parameters**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| period | string | week | Período (day, week, month, year) |

**Respuesta Exitosa (200 OK)**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "users": {
      "total": 12500,
      "new": 245,
      "active": 8900
    },
    "restaurants": {
      "total": 156,
      "active": 142
    },
    "orders": {
      "total": 3456,
      "revenue": 485000.00,
      "averageTicket": 140.35,
      "byStatus": {
        "completed": 3100,
        "cancelled": 156,
        "pending": 200
      }
    },
    "reservations": {
      "total": 890,
      "completed": 756,
      "noShow": 45
    },
    "topRestaurants": [
      {
        "id": "rest-001",
        "name": "La Trattoria Italiana",
        "orders": 245,
        "revenue": 48500.00
      }
    ]
  }
}
```

---

## 15. Webhooks (Eventos del Sistema)

### 15.1 Registro de Webhook

```http
POST /webhooks
```

**Body**
```json
{
  "url": "https://mi-sistema.com/webhooks/restaurants",
  "events": [
    "order.created",
    "order.status_changed",
    "reservation.created",
    "reservation.cancelled"
  ],
  "secret": "mi_secreto_webhook"
}
```

### 15.2 Eventos Disponibles

| Evento | Descripción |
|--------|-------------|
| `order.created` | Nuevo pedido creado |
| `order.status_changed` | Cambio de estado en pedido |
| `order.cancelled` | Pedido cancelado |
| `reservation.created` | Nueva reservación |
| `reservation.confirmed` | Reservación confirmada |
| `reservation.cancelled` | Reservación cancelada |
| `review.created` | Nueva reseña publicada |

### 15.3 Payload de Webhook

```json
{
  "event": "order.status_changed",
  "timestamp": "2024-01-22T12:00:00Z",
  "data": {
    "orderId": "order-002",
    "orderNumber": "ORD-20240121-000001",
    "previousStatus": "pending",
    "newStatus": "confirmed",
    "restaurantId": "rest-001"
  },
  "signature": "sha256=abc123..."
}
```

---

## 16. Límites y Cuotas

### 16.1 Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Auth (login/register) | 10 | 15 min |
| General API | 100 | 1 min |
| Búsquedas | 30 | 1 min |
| Uploads | 10 | 1 hora |

### 16.2 Headers de Rate Limit

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705927200
```

### 16.3 Respuesta 429 (Rate Limit Exceeded)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Has excedido el límite de peticiones. Intenta de nuevo en 45 segundos.",
    "retryAfter": 45
  }
}
```

---

## 17. Versionado

| Versión | Estado | Fecha Deprecación |
|---------|--------|-------------------|
| v1 | Actual | - |

---

*Documento de contratos API REST para el sistema de gestión de restaurantes.*

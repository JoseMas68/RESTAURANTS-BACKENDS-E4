# P2 Frontend Setup - Next.js 15 + React 19 + TypeScript + TailwindCSS

## Paso 1: Crear el Proyecto Next.js

Ejecuta en la raíz del repositorio:

```bash
cd c:\Users\Jose\restaurants-backend-e4
npx create-next-app@latest app/frontend --typescript --tailwind --app --no-eslint --no-git
```

**Respuestas a las preguntas del CLI:**
```
✔ Would you like to use TypeScript? › Yes
✔ Would you like to use ESLint? › No (lo configuraremos manualmente después)
✔ Would you like to use Tailwind CSS? › Yes
✔ Would you like your code inside a `src/` directory? › No
✔ Would you like to use App Router? › Yes
✔ Would you like to use Turbopack for next/build? › Yes (opcional, para velocidad)
✔ Would you like to customize the import alias? › Yes
  Import alias: @/* (default)
```

---

## Paso 2: Instalar Dependencias Adicionales

```bash
cd app/frontend

# UI y utilidades
npm install clsx class-variance-authority

# Cliente HTTP para consumir API
npm install axios

# State management (recomendado: Zustand)
npm install zustand

# Validación de formularios (opcional)
npm install react-hook-form zod @hookform/resolvers

# Utilidades de formato
npm install date-fns

# SEO (Next.js ya incluye soporte, pero es bueno tenerlo claro)
# next/head se reemplaza por metadata en App Router
```

---

## Paso 3: Estructura de Carpetas

```
app/frontend/
├── app/
│   ├── layout.tsx                    # Layout raíz
│   ├── page.tsx                      # / (Home)
│   ├── globals.css                   # Estilos globales
│   ├── restaurants/
│   │   ├── page.tsx                  # /restaurants (listado completo)
│   │   └── [id]/
│   │       ├── page.tsx              # /restaurants/[id] (detalle)
│   │       └── reviews/
│   │           └── page.tsx          # /restaurants/[id]/reviews (futuro)
│   ├── api/                          # API routes (si necesitas backend en Next)
│   │   └── health/
│   │       └── route.ts              # GET /api/health (verificación)
│   └── not-found.tsx                 # 404 personalizado
├── components/
│   ├── atoms/                        # Componentes básicos
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Rating.tsx
│   │   └── Alert.tsx
│   ├── molecules/                    # Componentes compuestos
│   │   ├── SearchBar.tsx
│   │   ├── Pagination.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── SkeletonLoader.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Modal.tsx
│   ├── organisms/                    # Componentes de página
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── RestaurantCard.tsx
│   │   ├── RestaurantGrid.tsx
│   │   ├── MenuSection.tsx
│   │   ├── ReservationForm.tsx
│   │   └── ReviewList.tsx
│   └── icons/                        # Iconos reutilizables
│       ├── SearchIcon.tsx
│       ├── StarIcon.tsx
│       └── ...más según necesidad
├── lib/
│   ├── api.ts                        # Cliente HTTP (axios instance)
│   ├── constants.ts                  # Constantes y URLs
│   ├── utils.ts                      # Funciones auxiliares
│   └── validators.ts                 # Validación de formularios (Zod schemas)
├── store/
│   ├── restaurantStore.ts            # Zustand store para restaurantes
│   ├── reservationStore.ts           # Zustand store para reservas
│   └── uiStore.ts                    # Zustand store para UI
├── types/
│   ├── index.ts                      # Tipos principales
│   ├── restaurant.ts
│   ├── menu.ts
│   ├── review.ts
│   └── reservation.ts
├── hooks/
│   ├── useRestaurants.ts             # Hook personalizado
│   ├── useReservation.ts
│   ├── useFetch.ts                   # Hook genérico para fetch
│   └── useLocalStorage.ts
├── public/
│   └── images/
│       └── placeholder.png           # Imagen de fallback
├── .env.local                        # Variables de entorno
├── .env.example                      # Plantilla de env
├── next.config.ts                    # Configuración Next.js
├── tailwind.config.ts                # Configuración Tailwind
├── tsconfig.json                     # Configuración TypeScript
├── package.json                      # Dependencias
└── README.md                         # Documentación del proyecto
```

---

## Paso 4: Contenido Inicial - `app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';

export const metadata: Metadata = {
  title: 'Restaurants E4 - Descubre y Reserva',
  description: 'Plataforma de búsqueda y reserva de restaurantes',
  openGraph: {
    title: 'Restaurants E4',
    description: 'Descubre los mejores restaurantes y reserva tu mesa',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900 antialiased">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

---

## Paso 5: Contenido Inicial - `app/page.tsx` (Home)

```typescript
'use client';

import React, { useState } from 'react';
import SearchBar from '@/components/molecules/SearchBar';
import RestaurantGrid from '@/components/organisms/RestaurantGrid';
import Pagination from '@/components/molecules/Pagination';

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    cuisine: '',
    minRating: 0,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Descubre Restaurantes</h1>
          <p className="text-xl mb-8">Explora, reserva y disfruta de los mejores espacios gastronómicos</p>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white shadow-md py-8">
        <div className="container mx-auto px-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Restaurant Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Restaurantes Destacados</h2>
          <p className="text-gray-600 mt-2">Mostrando {1 + (page - 1) * 10}-{Math.min(page * 10, 50)} de 50 restaurantes</p>
        </div>

        {/* Placeholder para grid de restaurantes */}
        <RestaurantGrid
          restaurants={[
            {
              id: '1',
              name: 'Restaurante Ejemplo 1',
              cuisine: 'Italiana',
              rating: 4.5,
              imageUrl: '/placeholder.png',
            },
            {
              id: '2',
              name: 'Restaurante Ejemplo 2',
              cuisine: 'Japonesa',
              rating: 4.8,
              imageUrl: '/placeholder.png',
            },
            {
              id: '3',
              name: 'Restaurante Ejemplo 3',
              cuisine: 'Mediterránea',
              rating: 4.2,
              imageUrl: '/placeholder.png',
            },
          ]}
          isLoading={false}
        />

        {/* Pagination */}
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={5}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}
```

---

## Paso 6: Contenido Inicial - `app/restaurants/page.tsx` (Listado Completo)

```typescript
'use client';

import React, { useState } from 'react';
import SearchBar from '@/components/molecules/SearchBar';
import RestaurantGrid from '@/components/organisms/RestaurantGrid';
import Pagination from '@/components/molecules/Pagination';

export default function RestaurantsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Title */}
      <section className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Todos los Restaurantes</h1>
          <p className="text-gray-600">Busca y filtra entre nuestras opciones gastronómicas</p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white shadow-sm py-6 mb-8">
        <div className="container mx-auto px-4">
          <SearchBar onSearch={(q) => {}} />

          {/* View Toggle */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Vista Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Vista Lista
            </button>
          </div>
        </div>
      </section>

      {/* Restaurant Grid */}
      <section className="container mx-auto px-4 py-8">
        <RestaurantGrid
          restaurants={[]}
          isLoading={true}
        />
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={1}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}
```

---

## Paso 7: Contenido Inicial - `app/restaurants/[id]/page.tsx` (Detalle)

```typescript
'use client';

import React, { useState } from 'react';
import MenuSection from '@/components/organisms/MenuSection';
import ReservationForm from '@/components/organisms/ReservationForm';
import ReviewList from '@/components/organisms/ReviewList';
import LoadingSpinner from '@/components/molecules/LoadingSpinner';

interface RestaurantDetailPageProps {
  params: {
    id: string;
  };
}

export default function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = params;
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-96 bg-gray-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-8 text-white">
            <h1 className="text-5xl font-bold mb-2">Restaurante Ejemplo</h1>
            <p className="text-lg opacity-90">Cocina Italiana | ★ 4.5 (128 reseñas)</p>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-gray-50 border-b py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Dirección</p>
              <p className="font-semibold">Calle Principal 123, Ciudad</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <a href="tel:+34900000000" className="font-semibold text-blue-600">+34 900 000 000</a>
            </div>
            <div>
              <p className="text-sm text-gray-600">Horarios</p>
              <p className="font-semibold">12:00 - 23:00</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="font-semibold text-green-600">Abierto ahora</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Menu & Reviews */}
          <div className="lg:col-span-2 space-y-12">
            {/* Menu Section */}
            <section id="menu">
              <h2 className="text-3xl font-bold mb-6">Menú</h2>
              <MenuSection />
            </section>

            {/* Reviews Section */}
            <section id="reviews">
              <h2 className="text-3xl font-bold mb-6">Reseñas</h2>
              <ReviewList />
            </section>
          </div>

          {/* Right Column - Reservation Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Reservar Mesa</h2>
              <ReservationForm restaurantId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Paso 8: Crear Archivos de Configuración

### `lib/constants.ts`

```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const CUISINES = [
  'Italiana',
  'Japonesa',
  'Mediterránea',
  'Mexicana',
  'Tailandesa',
  'Española',
  'Francesa',
  'Fusión',
];

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Mejor valorado' },
  { value: 'newest', label: 'Más nuevo' },
  { value: 'popularity', label: 'Más popular' },
  { value: 'name', label: 'A-Z' },
];

export const PRICE_RANGES = [
  { value: '1', label: '$' },
  { value: '2', label: '$$' },
  { value: '3', label: '$$$' },
  { value: '4', label: '$$$$' },
];
```

### `lib/api.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from './constants';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
```

### `.env.example`

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

### `.env.local` (crear localmente, NO commitear)

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

---

## Paso 9: Componente Base - `components/atoms/Button.tsx`

```typescript
import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
}
```

---

## Paso 10: Script de Package.json

Tu `package.json` debe tener:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Paso 11: Variables de Entorno - `.env.example`

```
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

---

## Próximos Pasos

1. **Ejecutar el dev server:**
   ```bash
   cd app/frontend
   npm run dev
   ```
   → Acceder a `http://localhost:3000`

2. **Crear componentes Atoms** (Button, Input, Select, Badge, Rating, Alert)

3. **Crear componentes Molecules** (SearchBar, Pagination, LoadingSpinner, EmptyState, Modal)

4. **Crear componentes Organisms** (Header, Footer, RestaurantCard, MenuSection, ReservationForm, ReviewList)

5. **Implementar Zustand stores** para state management

6. **Conectar API real** (reemplazar datos placeholder)

7. **Agregar validaciones** con React Hook Form + Zod

8. **Testing** con Jest + React Testing Library

---

## Notas

- **TypeScript strict mode** ya está habilitado
- **Tailwind CSS** listo para usar
- **App Router** de Next.js 15 (con `'use client'` para componentes interactivos)
- **Alias de importación** configurado con `@/*` para imports limpios
- **Sin ESLint** inicialmente (configurar manualmente después si se necesita)

¡Listo para comenzar! 🚀

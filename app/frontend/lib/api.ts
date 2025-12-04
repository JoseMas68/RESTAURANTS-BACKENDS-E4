/**
 * API Client para Restaurants E4 Backend
 * Consume endpoints de la API del backend NestJS
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ============================================================================
// TIPOS / INTERFACES
// ============================================================================

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  location?: {
    lat: number;
    lng: number;
  };
  capacity?: number;
  schedule?: Schedule[];
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Schedule {
  day: string; // 'Monday', 'Tuesday', ...
  openTime: string; // '12:00'
  closeTime: string; // '23:00'
  isClosed?: boolean;
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  restaurantId: string;
  products?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isAvailable: boolean;
  allergens?: string[];
  dietary?: string[];
  displayOrder: number;
  restaurantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

// ============================================================================
// CLASE DE ERROR PERSONALIZADA
// ============================================================================

export class ApiError extends Error {
  public statusCode: number;
  public error?: string;

  constructor(message: string, statusCode: number, error?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Realiza una petición fetch genérica con manejo de errores
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Si la respuesta no es OK, lanzar error
    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      }));

      throw new ApiError(
        errorData.message || 'Error en la petición',
        response.status,
        errorData.error
      );
    }

    // Parsear y retornar datos
    const data: T = await response.json();
    return data;
  } catch (error) {
    // Si es un error de API, re-lanzarlo
    if (error instanceof ApiError) {
      throw error;
    }

    // Si es un error de red u otro, envolverlo
    if (error instanceof Error) {
      throw new ApiError(
        error.message || 'Error de conexión',
        0,
        'NETWORK_ERROR'
      );
    }

    throw new ApiError('Error desconocido', 0);
  }
}

// ============================================================================
// FUNCIONES DE API - RESTAURANTES
// ============================================================================

/**
 * Obtener lista paginada de restaurantes
 * @param page Número de página (default: 1)
 * @param limit Límite de resultados por página (default: 10)
 * @param search Búsqueda por nombre/descripción (optional)
 * @param sort Ordenamiento: 'rating', 'newest', 'popularity' (optional)
 * @returns Lista paginada de restaurantes
 */
export async function getRestaurants(
  page: number = 1,
  limit: number = 10,
  search?: string,
  sort?: string
): Promise<PaginatedResponse<Restaurant>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());

  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);

  return fetchAPI<PaginatedResponse<Restaurant>>(
    `/restaurants?${params.toString()}`,
    {
      method: 'GET',
    }
  );
}

/**
 * Obtener un restaurante por ID o slug
 * @param id ID o slug del restaurante
 * @returns Datos del restaurante
 */
export async function getRestaurantById(id: string): Promise<Restaurant> {
  if (!id) {
    throw new ApiError('ID de restaurante requerido', 400);
  }

  return fetchAPI<Restaurant>(`/restaurants/${id}`, {
    method: 'GET',
  });
}

/**
 * Obtener restaurante por identificador (UUID o slug)
 * @param identifier UUID o slug del restaurante
 * @returns Datos del restaurante
 */
export async function getRestaurantByIdentifier(
  identifier: string
): Promise<Restaurant> {
  return getRestaurantById(identifier);
}

// ============================================================================
// FUNCIONES DE API - MENÚS
// ============================================================================

/**
 * Obtener menús (categorías) de un restaurante
 * @param restaurantId ID del restaurante
 * @returns Lista de menús/categorías
 */
export async function getMenuByRestaurantId(
  restaurantId: string
): Promise<Menu[]> {
  if (!restaurantId) {
    throw new ApiError('ID de restaurante requerido', 400);
  }

  return fetchAPI<Menu[]>(
    `/restaurants/${restaurantId}/menus`,
    {
      method: 'GET',
    }
  );
}

/**
 * Obtener menú completo estructurado de un restaurante
 * @param restaurantId ID del restaurante
 * @returns Menú completo con items anidados
 */
export async function getFullMenuByRestaurantId(
  restaurantId: string
): Promise<Menu> {
  if (!restaurantId) {
    throw new ApiError('ID de restaurante requerido', 400);
  }

  return fetchAPI<Menu>(
    `/restaurants/${restaurantId}/menu`,
    {
      method: 'GET',
    }
  );
}

/**
 * Obtener items de menú de un restaurante (sin agrupar)
 * @param restaurantId ID del restaurante
 * @param limit Límite de resultados (optional)
 * @param page Página (optional)
 * @returns Lista paginada de items
 */
export async function getMenuItemsByRestaurantId(
  restaurantId: string,
  limit?: number,
  page?: number
): Promise<PaginatedResponse<MenuItem> | MenuItem[]> {
  if (!restaurantId) {
    throw new ApiError('ID de restaurante requerido', 400);
  }

  const params = new URLSearchParams();
  if (limit) params.set('limit', limit.toString());
  if (page) params.set('page', page.toString());

  return fetchAPI<PaginatedResponse<MenuItem> | MenuItem[]>(
    `/restaurants/${restaurantId}/menu-items?${params.toString()}`,
    {
      method: 'GET',
    }
  );
}

/**
 * Obtener un item de menú específico
 * @param restaurantId ID del restaurante
 * @param itemId ID del item
 * @returns Datos del item de menú
 */
export async function getMenuItemById(
  restaurantId: string,
  itemId: string
): Promise<MenuItem> {
  if (!restaurantId || !itemId) {
    throw new ApiError('ID de restaurante e item requeridos', 400);
  }

  return fetchAPI<MenuItem>(
    `/restaurants/${restaurantId}/menu-items/${itemId}`,
    {
      method: 'GET',
    }
  );
}

// ============================================================================
// FUNCIONES PARA FUTURAS FUNCIONALIDADES
// ============================================================================

/**
 * Obtener reseñas de un restaurante
 * @param restaurantId ID del restaurante
 * @param limit Límite de resultados (default: 10)
 * @param page Página (default: 1)
 * @returns Lista paginada de reseñas
 */
export async function getReviewsByRestaurantId(
  restaurantId: string,
  limit: number = 10,
  page: number = 1
) {
  if (!restaurantId) {
    throw new ApiError('ID de restaurante requerido', 400);
  }

  const params = new URLSearchParams();
  params.set('restaurantId', restaurantId);
  params.set('limit', limit.toString());
  params.set('page', page.toString());

  return fetchAPI(`/reviews?${params.toString()}`, {
    method: 'GET',
  });
}

/**
 * Obtener disponibilidad de reservas
 * @param restaurantId ID del restaurante
 * @param date Fecha en formato YYYY-MM-DD
 * @param partySize Cantidad de personas
 * @returns Disponibilidad de mesas y horarios
 */
export async function getAvailability(
  restaurantId: string,
  date: string,
  partySize: number
) {
  if (!restaurantId || !date || !partySize) {
    throw new ApiError('Parámetros requeridos faltantes', 400);
  }

  const params = new URLSearchParams();
  params.set('date', date);
  params.set('partySize', partySize.toString());

  return fetchAPI(
    `/restaurants/${restaurantId}/bookings/availability?${params.toString()}`,
    {
      method: 'GET',
    }
  );
}

/**
 * Crear una reserva
 * @param restaurantId ID del restaurante
 * @param reservationData Datos de la reserva
 * @returns Confirmación de reserva con código
 */
export async function createReservation(
  restaurantId: string,
  reservationData: {
    date: string;
    time: string;
    partySize: number;
    customerId?: string;
    name: string;
    email: string;
    phone: string;
    notes?: string;
    tableId?: string;
  }
) {
  if (!restaurantId) {
    throw new ApiError('ID de restaurante requerido', 400);
  }

  return fetchAPI(
    `/restaurants/${restaurantId}/bookings`,
    {
      method: 'POST',
      body: JSON.stringify(reservationData),
    }
  );
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Verificar si la API está disponible
 * @returns true si la API responde correctamente
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

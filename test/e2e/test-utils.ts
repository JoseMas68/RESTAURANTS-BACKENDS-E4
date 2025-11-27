import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import * as request from 'supertest';

/**
 * Utilidades para tests E2E
 */

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface TestRestaurant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
}

export interface TestReservation {
  id: string;
  reservationNumber: string;
  restaurantId: string;
  customerId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea y configura la aplicación NestJS para testing
 */
export async function createTestingApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Configurar pipes globales (igual que en main.ts)
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();

  return app;
}

/**
 * Limpia la base de datos para tests
 * IMPORTANTE: Solo usar en entorno de testing
 */
export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  // Orden importante por foreign keys
  const tablesToClean = [
    'reviews',
    'order_items',
    'orders',
    'reservations',
    'products',
    'categories',
    'schedules',
    'tables',
    'addresses',
    'restaurants',
    'users',
  ];

  for (const table of tablesToClean) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTORIES - Crear datos de prueba
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera datos para un usuario de prueba
 */
export function generateUserData(overrides: Partial<TestUser> = {}) {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@ejemplo.com`,
    password: 'SecurePass123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+52 55 1234 5678',
    ...overrides,
  };
}

/**
 * Genera datos para un restaurante de prueba
 */
export function generateRestaurantData(overrides: Partial<any> = {}) {
  const timestamp = Date.now();
  return {
    name: `Restaurante Test ${timestamp}`,
    description: 'Restaurante de prueba para tests E2E',
    phone: '+52 55 9876 5432',
    email: `restaurant-${timestamp}@test.com`,
    addressLine: 'Av. Test 123',
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '06000',
    country: 'México',
    latitude: 19.4326,
    longitude: -99.1332,
    schedules: [
      { dayOfWeek: 0, openTime: '12:00', closeTime: '22:00' },
      { dayOfWeek: 1, openTime: '12:00', closeTime: '23:00' },
      { dayOfWeek: 2, openTime: '12:00', closeTime: '23:00' },
      { dayOfWeek: 3, openTime: '12:00', closeTime: '23:00' },
      { dayOfWeek: 4, openTime: '12:00', closeTime: '23:00' },
      { dayOfWeek: 5, openTime: '12:00', closeTime: '00:00' },
      { dayOfWeek: 6, openTime: '12:00', closeTime: '00:00' },
    ],
    ...overrides,
  };
}

/**
 * Genera datos para una reservación de prueba
 */
export function generateReservationData(
  restaurantId: string,
  overrides: Partial<any> = {},
) {
  // Fecha futura (mañana)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  return {
    restaurantId,
    partySize: 4,
    reservationDate: dateStr,
    reservationTime: '20:00',
    notes: 'Reservación de prueba',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS - Acciones comunes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registra un usuario y retorna sus datos con tokens
 */
export async function registerUser(
  app: INestApplication,
  userData?: Partial<TestUser>,
): Promise<TestUser> {
  const data = generateUserData(userData);

  const response = await request(app.getHttpServer())
    .post('/v1/auth/register')
    .send(data)
    .expect(201);

  return {
    id: response.body.data.user.id,
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: response.body.data.user.role,
    accessToken: response.body.data.tokens.accessToken,
    refreshToken: response.body.data.tokens.refreshToken,
  };
}

/**
 * Hace login y retorna los tokens
 */
export async function loginUser(
  app: INestApplication,
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await request(app.getHttpServer())
    .post('/v1/auth/login')
    .send({ email, password })
    .expect(200);

  return {
    accessToken: response.body.data.tokens.accessToken,
    refreshToken: response.body.data.tokens.refreshToken,
  };
}

/**
 * Crea un restaurante de prueba
 */
export async function createTestRestaurant(
  app: INestApplication,
  accessToken: string,
  restaurantData?: Partial<any>,
): Promise<TestRestaurant> {
  const data = generateRestaurantData(restaurantData);

  const response = await request(app.getHttpServer())
    .post('/v1/restaurants')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(data)
    .expect(201);

  return {
    id: response.body.data.id,
    name: response.body.data.name,
    slug: response.body.data.slug,
    ownerId: response.body.data.ownerId,
  };
}

/**
 * Crea una reservación de prueba
 */
export async function createTestReservation(
  app: INestApplication,
  accessToken: string,
  restaurantId: string,
  reservationData?: Partial<any>,
): Promise<TestReservation> {
  const data = generateReservationData(restaurantId, reservationData);

  const response = await request(app.getHttpServer())
    .post('/v1/reservations')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(data)
    .expect(201);

  return {
    id: response.body.data.id,
    reservationNumber: response.body.data.reservationNumber,
    restaurantId: response.body.data.restaurant.id,
    customerId: response.body.data.customerId,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSERTIONS - Validaciones comunes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valida la estructura de respuesta exitosa
 */
export function expectSuccessResponse(body: any): void {
  expect(body).toHaveProperty('success', true);
  expect(body).toHaveProperty('data');
}

/**
 * Valida la estructura de respuesta de error
 */
export function expectErrorResponse(
  body: any,
  expectedCode?: string,
): void {
  expect(body).toHaveProperty('success', false);
  expect(body).toHaveProperty('error');
  expect(body.error).toHaveProperty('code');
  expect(body.error).toHaveProperty('message');

  if (expectedCode) {
    expect(body.error.code).toBe(expectedCode);
  }
}

/**
 * Valida la estructura de paginación
 */
export function expectPaginationResponse(body: any): void {
  expect(body).toHaveProperty('pagination');
  expect(body.pagination).toHaveProperty('page');
  expect(body.pagination).toHaveProperty('limit');
  expect(body.pagination).toHaveProperty('total');
  expect(body.pagination).toHaveProperty('totalPages');
  expect(body.pagination).toHaveProperty('hasNext');
  expect(body.pagination).toHaveProperty('hasPrev');
}

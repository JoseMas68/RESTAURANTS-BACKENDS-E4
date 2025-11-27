import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/database/prisma.service';
import {
  createTestingApp,
  cleanDatabase,
  registerUser,
  createTestRestaurant,
  generateRestaurantData,
  expectSuccessResponse,
  expectErrorResponse,
  expectPaginationResponse,
  TestUser,
  TestRestaurant,
} from './test-utils';

describe('RestaurantsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let managerUser: TestUser;
  let customerUser: TestUser;
  let testRestaurant: TestRestaurant;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    // Crear usuarios de prueba
    managerUser = await registerUser(app, { role: 'manager' } as any);
    customerUser = await registerUser(app);

    // Crear restaurante de prueba
    testRestaurant = await createTestRestaurant(app, managerUser.accessToken!);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GET /restaurants
  // ───────────────────────────────────────────────────────────────────────────

  describe('GET /v1/restaurants', () => {
    it('debe listar restaurantes sin autenticación', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/restaurants')
        .expect(200);

      expectSuccessResponse(response.body);
      expectPaginationResponse(response.body);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debe retornar restaurantes con paginación', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/restaurants')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('debe filtrar restaurantes por ciudad', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/restaurants')
        .query({ city: 'Ciudad de México' })
        .expect(200);

      expectSuccessResponse(response.body);
      response.body.data.forEach((restaurant: any) => {
        expect(restaurant.address.city).toBe('Ciudad de México');
      });
    });

    it('debe filtrar por rating mínimo', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/restaurants')
        .query({ rating: 4 })
        .expect(200);

      expectSuccessResponse(response.body);
      response.body.data.forEach((restaurant: any) => {
        expect(restaurant.averageRating).toBeGreaterThanOrEqual(4);
      });
    });

    it('debe buscar restaurantes por nombre', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/restaurants')
        .query({ search: 'Test' })
        .expect(200);

      expectSuccessResponse(response.body);
    });

    it('debe ordenar restaurantes por rating descendente', async () => {
      // Crear varios restaurantes
      await createTestRestaurant(app, managerUser.accessToken!);
      await createTestRestaurant(app, managerUser.accessToken!);

      const response = await request(app.getHttpServer())
        .get('/v1/restaurants')
        .query({ sortBy: 'rating', sortOrder: 'desc' })
        .expect(200);

      expectSuccessResponse(response.body);

      const ratings = response.body.data.map((r: any) => r.averageRating);
      for (let i = 1; i < ratings.length; i++) {
        expect(ratings[i - 1]).toBeGreaterThanOrEqual(ratings[i]);
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GET /restaurants/:identifier
  // ───────────────────────────────────────────────────────────────────────────

  describe('GET /v1/restaurants/:identifier', () => {
    it('debe obtener restaurante por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/restaurants/${testRestaurant.id}`)
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data.id).toBe(testRestaurant.id);
      expect(response.body.data.name).toBe(testRestaurant.name);
      expect(response.body.data).toHaveProperty('schedules');
      expect(response.body.data).toHaveProperty('address');
    });

    it('debe obtener restaurante por slug', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/restaurants/${testRestaurant.slug}`)
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data.slug).toBe(testRestaurant.slug);
    });

    it('debe retornar 404 si el restaurante no existe', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/restaurants/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expectErrorResponse(response.body, 'NOT_FOUND');
    });

    it('debe retornar 404 con slug inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/restaurants/restaurante-que-no-existe')
        .expect(404);

      expectErrorResponse(response.body, 'NOT_FOUND');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /restaurants
  // ───────────────────────────────────────────────────────────────────────────

  describe('POST /v1/restaurants', () => {
    it('debe crear un restaurante con rol manager', async () => {
      const restaurantData = generateRestaurantData();

      const response = await request(app.getHttpServer())
        .post('/v1/restaurants')
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send(restaurantData)
        .expect(201);

      expectSuccessResponse(response.body);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('slug');
      expect(response.body.data.name).toBe(restaurantData.name);
    });

    it('debe retornar 403 si el usuario es customer', async () => {
      const restaurantData = generateRestaurantData();

      const response = await request(app.getHttpServer())
        .post('/v1/restaurants')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send(restaurantData)
        .expect(403);

      expectErrorResponse(response.body, 'FORBIDDEN');
    });

    it('debe retornar 401 sin autenticación', async () => {
      const restaurantData = generateRestaurantData();

      const response = await request(app.getHttpServer())
        .post('/v1/restaurants')
        .send(restaurantData)
        .expect(401);

      expectErrorResponse(response.body, 'UNAUTHORIZED');
    });

    it('debe retornar 400 con datos inválidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/restaurants')
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ name: '' }) // Nombre vacío
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 409 si ya existe un restaurante con el mismo nombre', async () => {
      const restaurantData = generateRestaurantData({
        name: testRestaurant.name,
      });

      const response = await request(app.getHttpServer())
        .post('/v1/restaurants')
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send(restaurantData)
        .expect(409);

      expectErrorResponse(response.body, 'CONFLICT');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PATCH /restaurants/:restaurantId
  // ───────────────────────────────────────────────────────────────────────────

  describe('PATCH /v1/restaurants/:restaurantId', () => {
    it('debe actualizar un restaurante como propietario', async () => {
      const updateData = {
        description: 'Descripción actualizada',
        phone: '+52 55 1111 2222',
      };

      const response = await request(app.getHttpServer())
        .patch(`/v1/restaurants/${testRestaurant.id}`)
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send(updateData)
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    it('debe retornar 403 si no es propietario', async () => {
      const updateData = { description: 'Intento de hack' };

      const response = await request(app.getHttpServer())
        .patch(`/v1/restaurants/${testRestaurant.id}`)
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send(updateData)
        .expect(403);

      expectErrorResponse(response.body, 'FORBIDDEN');
    });

    it('debe retornar 404 si el restaurante no existe', async () => {
      const response = await request(app.getHttpServer())
        .patch('/v1/restaurants/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ description: 'Test' })
        .expect(404);

      expectErrorResponse(response.body, 'NOT_FOUND');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/products/menu
  // ───────────────────────────────────────────────────────────────────────────

  describe('GET /v1/restaurants/:restaurantId/products/menu', () => {
    it('debe obtener el menú completo sin autenticación', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/restaurants/${testRestaurant.id}/products/menu`)
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data).toHaveProperty('restaurant');
      expect(response.body.data).toHaveProperty('categories');
      expect(Array.isArray(response.body.data.categories)).toBe(true);
    });

    it('debe filtrar solo productos disponibles', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/restaurants/${testRestaurant.id}/products/menu`)
        .query({ availableOnly: true })
        .expect(200);

      expectSuccessResponse(response.body);

      response.body.data.categories.forEach((category: any) => {
        category.products.forEach((product: any) => {
          expect(product.isAvailable).toBe(true);
        });
      });
    });

    it('debe retornar 404 con restaurante inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/restaurants/00000000-0000-0000-0000-000000000000/products/menu')
        .expect(404);

      expectErrorResponse(response.body, 'NOT_FOUND');
    });
  });
});

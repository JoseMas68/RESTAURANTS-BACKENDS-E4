import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/database/prisma.service';
import {
  createTestingApp,
  cleanDatabase,
  registerUser,
  createTestRestaurant,
  createTestReservation,
  generateReservationData,
  expectSuccessResponse,
  expectErrorResponse,
  expectPaginationResponse,
  TestUser,
  TestRestaurant,
  TestReservation,
} from './test-utils';

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let managerUser: TestUser;
  let customerUser: TestUser;
  let anotherCustomer: TestUser;
  let testRestaurant: TestRestaurant;
  let testReservation: TestReservation;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    // Crear usuarios de prueba
    managerUser = await registerUser(app, { role: 'manager' } as any);
    customerUser = await registerUser(app);
    anotherCustomer = await registerUser(app);

    // Crear restaurante de prueba
    testRestaurant = await createTestRestaurant(app, managerUser.accessToken!);

    // Crear reservación de prueba
    testReservation = await createTestReservation(
      app,
      customerUser.accessToken!,
      testRestaurant.id,
    );
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/reservations/availability
  // ───────────────────────────────────────────────────────────────────────────

  describe('GET /v1/restaurants/:restaurantId/reservations/availability', () => {
    it('debe obtener disponibilidad sin autenticación', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app.getHttpServer())
        .get(`/v1/restaurants/${testRestaurant.id}/reservations/availability`)
        .query({ date: dateStr, partySize: 4 })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data).toHaveProperty('date');
      expect(response.body.data).toHaveProperty('partySize');
      expect(response.body.data).toHaveProperty('availableSlots');
      expect(Array.isArray(response.body.data.availableSlots)).toBe(true);
    });

    it('debe retornar slots con tiempo y mesas disponibles', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app.getHttpServer())
        .get(`/v1/restaurants/${testRestaurant.id}/reservations/availability`)
        .query({ date: dateStr, partySize: 2 })
        .expect(200);

      if (response.body.data.availableSlots.length > 0) {
        const slot = response.body.data.availableSlots[0];
        expect(slot).toHaveProperty('time');
        expect(slot).toHaveProperty('tablesAvailable');
        expect(typeof slot.time).toBe('string');
        expect(typeof slot.tablesAvailable).toBe('number');
      }
    });

    it('debe retornar 400 si falta la fecha', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/restaurants/${testRestaurant.id}/reservations/availability`)
        .query({ partySize: 4 })
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 400 si falta partySize', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/restaurants/${testRestaurant.id}/reservations/availability`)
        .query({ date: '2024-01-25' })
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 400 si partySize es inválido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/restaurants/${testRestaurant.id}/reservations/availability`)
        .query({ date: '2024-01-25', partySize: 0 })
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 404 con restaurante inexistente', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/restaurants/00000000-0000-0000-0000-000000000000/reservations/availability')
        .query({ date: '2024-01-25', partySize: 4 })
        .expect(404);

      expectErrorResponse(response.body, 'NOT_FOUND');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /reservations
  // ───────────────────────────────────────────────────────────────────────────

  describe('POST /v1/reservations', () => {
    it('debe crear una reservación exitosamente', async () => {
      const reservationData = generateReservationData(testRestaurant.id);

      const response = await request(app.getHttpServer())
        .post('/v1/reservations')
        .set('Authorization', `Bearer ${anotherCustomer.accessToken}`)
        .send(reservationData)
        .expect(201);

      expectSuccessResponse(response.body);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('reservationNumber');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.partySize).toBe(reservationData.partySize);
      expect(response.body.data.reservationDate).toBe(reservationData.reservationDate);
      expect(response.body.data.reservationTime).toBe(reservationData.reservationTime);
      expect(response.body.data).toHaveProperty('restaurant');
    });

    it('debe retornar 401 sin autenticación', async () => {
      const reservationData = generateReservationData(testRestaurant.id);

      const response = await request(app.getHttpServer())
        .post('/v1/reservations')
        .send(reservationData)
        .expect(401);

      expectErrorResponse(response.body, 'UNAUTHORIZED');
    });

    it('debe retornar 400 con datos incompletos', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/reservations')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({
          restaurantId: testRestaurant.id,
          // Faltan partySize, date, time
        })
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 400 con partySize mayor a 20', async () => {
      const reservationData = generateReservationData(testRestaurant.id, {
        partySize: 25,
      });

      const response = await request(app.getHttpServer())
        .post('/v1/reservations')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send(reservationData)
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 400 con fecha pasada', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const reservationData = generateReservationData(testRestaurant.id, {
        reservationDate: yesterday.toISOString().split('T')[0],
      });

      const response = await request(app.getHttpServer())
        .post('/v1/reservations')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send(reservationData)
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 404 con restaurante inexistente', async () => {
      const reservationData = generateReservationData(
        '00000000-0000-0000-0000-000000000000',
      );

      const response = await request(app.getHttpServer())
        .post('/v1/reservations')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send(reservationData)
        .expect(404);

      expectErrorResponse(response.body, 'NOT_FOUND');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GET /reservations
  // ───────────────────────────────────────────────────────────────────────────

  describe('GET /v1/reservations', () => {
    it('debe listar las reservaciones del usuario', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/reservations')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .expect(200);

      expectSuccessResponse(response.body);
      expectPaginationResponse(response.body);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('debe filtrar solo reservaciones futuras', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/reservations')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .query({ upcoming: true })
        .expect(200);

      expectSuccessResponse(response.body);

      const today = new Date().toISOString().split('T')[0];
      response.body.data.forEach((reservation: any) => {
        expect(reservation.reservationDate >= today).toBe(true);
      });
    });

    it('debe filtrar por status', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/reservations')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .query({ status: 'pending' })
        .expect(200);

      expectSuccessResponse(response.body);
      response.body.data.forEach((reservation: any) => {
        expect(reservation.status).toBe('pending');
      });
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/reservations')
        .expect(401);

      expectErrorResponse(response.body, 'UNAUTHORIZED');
    });

    it('no debe mostrar reservaciones de otros usuarios', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/reservations')
        .set('Authorization', `Bearer ${anotherCustomer.accessToken}`)
        .expect(200);

      // El otro customer no tiene reservaciones
      expect(response.body.data.length).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PATCH /restaurants/:restaurantId/reservations/:reservationId/status
  // ───────────────────────────────────────────────────────────────────────────

  describe('PATCH /v1/restaurants/:restaurantId/reservations/:reservationId/status', () => {
    it('debe confirmar una reservación como propietario', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data.status).toBe('confirmed');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('debe marcar como seated', async () => {
      // Primero confirmar
      await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      // Luego seated
      const response = await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'seated' })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data.status).toBe('seated');
    });

    it('debe marcar como no_show', async () => {
      // Confirmar primero
      await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'no_show' })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data.status).toBe('no_show');
    });

    it('debe retornar 403 si no es propietario del restaurante', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({ status: 'confirmed' })
        .expect(403);

      expectErrorResponse(response.body, 'FORBIDDEN');
    });

    it('debe retornar 400 con status inválido', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 404 con reservación inexistente', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/00000000-0000-0000-0000-000000000000/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'confirmed' })
        .expect(404);

      expectErrorResponse(response.body, 'NOT_FOUND');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /reservations/:reservationId/cancel
  // ───────────────────────────────────────────────────────────────────────────

  describe('POST /v1/reservations/:reservationId/cancel', () => {
    it('debe cancelar una reservación propia', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/reservations/${testReservation.id}/cancel`)
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({ reason: 'Cambio de planes' })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.cancellationReason).toBe('Cambio de planes');
      expect(response.body.data).toHaveProperty('cancelledAt');
    });

    it('debe retornar 403 si intenta cancelar reservación ajena', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/reservations/${testReservation.id}/cancel`)
        .set('Authorization', `Bearer ${anotherCustomer.accessToken}`)
        .send({ reason: 'Intento de sabotaje' })
        .expect(403);

      expectErrorResponse(response.body, 'FORBIDDEN');
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/reservations/${testReservation.id}/cancel`)
        .send({ reason: 'Test' })
        .expect(401);

      expectErrorResponse(response.body, 'UNAUTHORIZED');
    });

    it('debe retornar 404 con reservación inexistente', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/reservations/00000000-0000-0000-0000-000000000000/cancel')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({ reason: 'Test' })
        .expect(404);

      expectErrorResponse(response.body, 'NOT_FOUND');
    });

    it('debe retornar 400 si la reservación ya está cancelada', async () => {
      // Cancelar primero
      await request(app.getHttpServer())
        .post(`/v1/reservations/${testReservation.id}/cancel`)
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({ reason: 'Primera cancelación' })
        .expect(200);

      // Intentar cancelar de nuevo
      const response = await request(app.getHttpServer())
        .post(`/v1/reservations/${testReservation.id}/cancel`)
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({ reason: 'Segunda cancelación' })
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 400 si la reservación ya está completada', async () => {
      // Confirmar → seated → completed
      await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'seated' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/status`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ status: 'completed' })
        .expect(200);

      // Intentar cancelar
      const response = await request(app.getHttpServer())
        .post(`/v1/reservations/${testReservation.id}/cancel`)
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({ reason: 'Intento tardío' })
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /restaurants/:restaurantId/reservations/:reservationId/confirm
  // ───────────────────────────────────────────────────────────────────────────

  describe('POST /v1/restaurants/:restaurantId/reservations/:reservationId/confirm', () => {
    it('debe confirmar con mesa asignada', async () => {
      // Primero crear una mesa
      const tableResponse = await request(app.getHttpServer())
        .post(`/v1/restaurants/${testRestaurant.id}/tables`)
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({
          tableNumber: '1',
          capacity: 6,
          location: 'terraza',
        })
        .expect(201);

      const tableId = tableResponse.body.data.id;

      // Confirmar con mesa
      const response = await request(app.getHttpServer())
        .post(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/confirm`,
        )
        .set('Authorization', `Bearer ${managerUser.accessToken}`)
        .send({ tableId })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data.status).toBe('confirmed');
      expect(response.body.data.table).toBeDefined();
      expect(response.body.data.table.id).toBe(tableId);
      expect(response.body.data).toHaveProperty('confirmedAt');
    });

    it('debe retornar 403 si no es propietario', async () => {
      const response = await request(app.getHttpServer())
        .post(
          `/v1/restaurants/${testRestaurant.id}/reservations/${testReservation.id}/confirm`,
        )
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({ tableId: 'some-table-id' })
        .expect(403);

      expectErrorResponse(response.body, 'FORBIDDEN');
    });
  });
});

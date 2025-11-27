import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/database/prisma.service';
import {
  createTestingApp,
  cleanDatabase,
  generateUserData,
  registerUser,
  expectSuccessResponse,
  expectErrorResponse,
} from './test-utils';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /auth/register
  // ───────────────────────────────────────────────────────────────────────────

  describe('POST /v1/auth/register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const userData = generateUserData();

      const response = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      expectSuccessResponse(response.body);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');

      // Verificar datos del usuario
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
      expect(response.body.data.user.role).toBe('customer');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');

      // Verificar tokens
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.tokens.expiresIn).toBeGreaterThan(0);
    });

    it('debe retornar 400 si el email es inválido', async () => {
      const userData = generateUserData({ email: 'invalid-email' });

      const response = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(userData)
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 400 si la contraseña es muy débil', async () => {
      const userData = generateUserData({ password: '123' });

      const response = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(userData)
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 400 si faltan campos requeridos', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ email: 'test@test.com' })
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });

    it('debe retornar 409 si el email ya existe', async () => {
      const userData = generateUserData();

      // Registrar primer usuario
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(userData)
        .expect(201);

      // Intentar registrar con el mismo email
      const response = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(userData)
        .expect(409);

      expectErrorResponse(response.body, 'CONFLICT');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /auth/login
  // ───────────────────────────────────────────────────────────────────────────

  describe('POST /v1/auth/login', () => {
    it('debe hacer login exitosamente con credenciales válidas', async () => {
      // Primero registrar un usuario
      const userData = generateUserData();
      await registerUser(app, userData);

      // Hacer login
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('debe retornar 401 con email incorrecto', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'SecurePass123!',
        })
        .expect(401);

      expectErrorResponse(response.body, 'UNAUTHORIZED');
    });

    it('debe retornar 401 con contraseña incorrecta', async () => {
      const userData = generateUserData();
      await registerUser(app, userData);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expectErrorResponse(response.body, 'UNAUTHORIZED');
    });

    it('debe retornar 400 si falta el email', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ password: 'SecurePass123!' })
        .expect(400);

      expectErrorResponse(response.body, 'VALIDATION_ERROR');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /auth/refresh
  // ───────────────────────────────────────────────────────────────────────────

  describe('POST /v1/auth/refresh', () => {
    it('debe refrescar el token exitosamente', async () => {
      const user = await registerUser(app);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .send({ refreshToken: user.refreshToken })
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.accessToken).not.toBe(user.accessToken);
    });

    it('debe retornar 401 con refresh token inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expectErrorResponse(response.body, 'UNAUTHORIZED');
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /auth/logout
  // ───────────────────────────────────────────────────────────────────────────

  describe('POST /v1/auth/logout', () => {
    it('debe cerrar sesión exitosamente', async () => {
      const user = await registerUser(app);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expectSuccessResponse(response.body);
      expect(response.body.data).toHaveProperty('message');
    });

    it('debe retornar 401 sin token', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .expect(401);

      expectErrorResponse(response.body, 'UNAUTHORIZED');
    });
  });
});

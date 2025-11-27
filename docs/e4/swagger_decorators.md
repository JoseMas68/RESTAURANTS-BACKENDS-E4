# Decoradores Swagger - Sistema de Restaurantes

## 1. Configuración Base

### 1.1 Instalación

```bash
npm install @nestjs/swagger swagger-ui-express
```

### 1.2 Configuración en main.ts

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Restaurants API')
    .setDescription('API para gestión de restaurantes, pedidos y reservaciones')
    .setVersion('1.0')
    .setContact(
      'Soporte API',
      'https://api.restaurants.com/support',
      'api@restaurants.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Desarrollo')
    .addServer('https://api.restaurants.com', 'Producción')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Addresses', 'Direcciones de entrega')
    .addTag('Restaurants', 'Gestión de restaurantes')
    .addTag('Categories', 'Categorías del menú')
    .addTag('Products', 'Productos del menú')
    .addTag('Tables', 'Mesas del restaurante')
    .addTag('Orders', 'Pedidos de clientes')
    .addTag('Restaurant Orders', 'Gestión de pedidos (restaurante)')
    .addTag('Reservations', 'Reservaciones de clientes')
    .addTag('Restaurant Reservations', 'Gestión de reservaciones')
    .addTag('Reviews', 'Reseñas y valoraciones')
    .addTag('Admin', 'Panel de administración')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
    customSiteTitle: 'Restaurants API Docs',
  });

  await app.listen(3000);
}
bootstrap();
```

---

## 2. Auth Controller

```typescript
// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponseDto,
  TokensDto,
  MessageResponseDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─────────────────────────────────────────────────────────────
  // POST /auth/register
  // ─────────────────────────────────────────────────────────────
  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario y retorna tokens de acceso',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Datos de registro del usuario',
    examples: {
      ejemplo1: {
        summary: 'Usuario básico',
        value: {
          email: 'usuario@ejemplo.com',
          password: 'SecurePass123!',
          firstName: 'Juan',
          lastName: 'Pérez',
          phone: '+52 55 1234 5678',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los datos proporcionados no son válidos',
          details: [
            { field: 'email', message: 'El formato del email es inválido' },
            { field: 'password', message: 'La contraseña debe tener al menos 8 caracteres' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
    schema: {
      example: {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'El email ya está registrado',
        },
      },
    },
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  // ─────────────────────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y retorna tokens de acceso',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciales de acceso',
    examples: {
      ejemplo1: {
        summary: 'Login estándar',
        value: {
          email: 'usuario@ejemplo.com',
          password: 'SecurePass123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales incorrectas',
    schema: {
      example: {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Email o contraseña incorrectos',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Cuenta desactivada',
    schema: {
      example: {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Tu cuenta ha sido desactivada',
        },
      },
    },
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  // ─────────────────────────────────────────────────────────────
  // POST /auth/refresh
  // ─────────────────────────────────────────────────────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refrescar token de acceso',
    description: 'Genera un nuevo access token usando el refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token válido',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados exitosamente',
    type: TokensDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokensDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  // ─────────────────────────────────────────────────────────────
  // POST /auth/logout
  // ─────────────────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Invalida el token actual del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token no proporcionado o inválido',
  })
  async logout(): Promise<MessageResponseDto> {
    return this.authService.logout();
  }

  // ─────────────────────────────────────────────────────────────
  // POST /auth/forgot-password
  // ─────────────────────────────────────────────────────────────
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description: 'Envía un email con instrucciones para restablecer la contraseña',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      ejemplo1: {
        value: { email: 'usuario@ejemplo.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado (si existe la cuenta)',
    type: MessageResponseDto,
    example: {
      success: true,
      data: {
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
      },
    },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(dto.email);
  }

  // ─────────────────────────────────────────────────────────────
  // POST /auth/reset-password
  // ─────────────────────────────────────────────────────────────
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description: 'Establece una nueva contraseña usando el token de recuperación',
  })
  @ApiBody({
    type: ResetPasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o expirado',
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.authService.resetPassword(dto);
  }
}
```

---

## 3. Users Controller

```typescript
// src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Put,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UserResponseDto,
  AvatarResponseDto,
  MessageResponseDto,
} from './dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  // ─────────────────────────────────────────────────────────────
  // GET /users/me
  // ─────────────────────────────────────────────────────────────
  @Get('me')
  @ApiOperation({
    summary: 'Obtener perfil actual',
    description: 'Retorna la información del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getProfile(): Promise<UserResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /users/me
  // ─────────────────────────────────────────────────────────────
  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar perfil',
    description: 'Actualiza los datos del perfil del usuario autenticado',
  })
  @ApiBody({
    type: UpdateProfileDto,
    examples: {
      actualizarNombre: {
        summary: 'Actualizar nombre',
        value: {
          firstName: 'Juan Carlos',
          lastName: 'Pérez García',
        },
      },
      actualizarTelefono: {
        summary: 'Actualizar teléfono',
        value: {
          phone: '+52 55 9876 5432',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async updateProfile(@Body() dto: UpdateProfileDto): Promise<UserResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PUT /users/me/password
  // ─────────────────────────────────────────────────────────────
  @Put('me/password')
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description: 'Permite al usuario cambiar su contraseña actual',
  })
  @ApiBody({
    type: ChangePasswordDto,
    examples: {
      ejemplo1: {
        value: {
          currentPassword: 'SecurePass123!',
          newPassword: 'NewSecurePass456!',
          newPasswordConfirmation: 'NewSecurePass456!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Contraseña actual incorrecta o las contraseñas no coinciden',
  })
  async changePassword(@Body() dto: ChangePasswordDto): Promise<MessageResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /users/me/avatar
  // ─────────────────────────────────────────────────────────────
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Subir avatar',
    description: 'Sube una imagen de perfil para el usuario',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de perfil (max 5MB, formatos: jpg, png, webp)',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar subido exitosamente',
    type: AvatarResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Formato no soportado o archivo muy grande',
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AvatarResponseDto> {}
}
```

---

## 4. Addresses Controller

```typescript
// src/modules/addresses/addresses.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateAddressDto,
  UpdateAddressDto,
  AddressResponseDto,
} from './dto';

@ApiTags('Addresses')
@ApiBearerAuth('JWT-auth')
@Controller('users/me/addresses')
export class AddressesController {
  // ─────────────────────────────────────────────────────────────
  // GET /users/me/addresses
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar direcciones',
    description: 'Obtiene todas las direcciones del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de direcciones',
    type: [AddressResponseDto],
  })
  async findAll(): Promise<AddressResponseDto[]> {}

  // ─────────────────────────────────────────────────────────────
  // POST /users/me/addresses
  // ─────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Crear dirección',
    description: 'Agrega una nueva dirección de entrega',
  })
  @ApiBody({
    type: CreateAddressDto,
    examples: {
      casa: {
        summary: 'Dirección de casa',
        value: {
          label: 'Casa',
          addressLine: 'Av. Reforma 123, Col. Centro',
          city: 'Ciudad de México',
          state: 'CDMX',
          postalCode: '06000',
          country: 'México',
          latitude: 19.4326,
          longitude: -99.1332,
          instructions: 'Edificio azul, departamento 4B',
          isDefault: true,
        },
      },
      oficina: {
        summary: 'Dirección de oficina',
        value: {
          label: 'Oficina',
          addressLine: 'Insurgentes Sur 1602, Piso 8',
          city: 'Ciudad de México',
          state: 'CDMX',
          postalCode: '03940',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Dirección creada',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async create(@Body() dto: CreateAddressDto): Promise<AddressResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /users/me/addresses/:addressId
  // ─────────────────────────────────────────────────────────────
  @Patch(':addressId')
  @ApiOperation({
    summary: 'Actualizar dirección',
    description: 'Modifica una dirección existente',
  })
  @ApiParam({
    name: 'addressId',
    type: 'string',
    format: 'uuid',
    description: 'ID de la dirección',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateAddressDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Dirección actualizada',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Dirección no encontrada',
  })
  async update(
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // DELETE /users/me/addresses/:addressId
  // ─────────────────────────────────────────────────────────────
  @Delete(':addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar dirección',
    description: 'Elimina una dirección del usuario',
  })
  @ApiParam({
    name: 'addressId',
    type: 'string',
    format: 'uuid',
    description: 'ID de la dirección',
  })
  @ApiResponse({
    status: 204,
    description: 'Dirección eliminada',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar la dirección predeterminada',
  })
  @ApiResponse({
    status: 404,
    description: 'Dirección no encontrada',
  })
  async remove(@Param('addressId') addressId: string): Promise<void> {}

  // ─────────────────────────────────────────────────────────────
  // PUT /users/me/addresses/:addressId/default
  // ─────────────────────────────────────────────────────────────
  @Put(':addressId/default')
  @ApiOperation({
    summary: 'Establecer como predeterminada',
    description: 'Define una dirección como la predeterminada del usuario',
  })
  @ApiParam({
    name: 'addressId',
    type: 'string',
    format: 'uuid',
    description: 'ID de la dirección',
  })
  @ApiResponse({
    status: 200,
    description: 'Dirección establecida como predeterminada',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Dirección no encontrada',
  })
  async setDefault(@Param('addressId') addressId: string): Promise<AddressResponseDto> {}
}
```

---

## 5. Restaurants Controller

```typescript
// src/modules/restaurants/restaurants.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  QueryRestaurantsDto,
  RestaurantResponseDto,
  RestaurantDetailResponseDto,
  ImageResponseDto,
  PaginatedRestaurantsResponseDto,
} from './dto';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  // ─────────────────────────────────────────────────────────────
  // GET /restaurants
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar restaurantes',
    description: 'Obtiene una lista paginada de restaurantes con filtros opcionales',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Resultados por página (max 50)',
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Búsqueda por nombre',
    example: 'italiana',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filtrar por ciudad',
    example: 'Ciudad de México',
  })
  @ApiQuery({
    name: 'rating',
    required: false,
    type: Number,
    description: 'Rating mínimo (1-5)',
    example: 4,
  })
  @ApiQuery({
    name: 'isOpen',
    required: false,
    type: Boolean,
    description: 'Solo restaurantes abiertos ahora',
  })
  @ApiQuery({
    name: 'lat',
    required: false,
    type: Number,
    description: 'Latitud para ordenar por cercanía',
    example: 19.4326,
  })
  @ApiQuery({
    name: 'lng',
    required: false,
    type: Number,
    description: 'Longitud para ordenar por cercanía',
    example: -99.1332,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'rating', 'name', 'distance'],
    description: 'Campo de ordenamiento',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Orden ascendente o descendente',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de restaurantes',
    type: PaginatedRestaurantsResponseDto,
  })
  async findAll(@Query() query: QueryRestaurantsDto): Promise<PaginatedRestaurantsResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:identifier
  // ─────────────────────────────────────────────────────────────
  @Get(':identifier')
  @ApiOperation({
    summary: 'Obtener restaurante',
    description: 'Obtiene un restaurante por su ID (UUID) o slug',
  })
  @ApiParam({
    name: 'identifier',
    type: 'string',
    description: 'ID (UUID) o slug del restaurante',
    examples: {
      uuid: {
        value: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'Búsqueda por UUID',
      },
      slug: {
        value: 'la-trattoria-italiana',
        summary: 'Búsqueda por slug',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle del restaurante',
    type: RestaurantDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurante no encontrado',
  })
  async findOne(@Param('identifier') identifier: string): Promise<RestaurantDetailResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /restaurants
  // ─────────────────────────────────────────────────────────────
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear restaurante',
    description: 'Crea un nuevo restaurante (requiere rol manager o admin)',
  })
  @ApiBody({
    type: CreateRestaurantDto,
    examples: {
      restaurante: {
        summary: 'Restaurante completo',
        value: {
          name: 'Sushi Master',
          description: 'Los mejores rolls de la ciudad',
          phone: '+52 55 9876 5432',
          email: 'info@sushimaster.com',
          addressLine: 'Av. Insurgentes Sur 1234',
          city: 'Ciudad de México',
          state: 'CDMX',
          postalCode: '03100',
          country: 'México',
          latitude: 19.391,
          longitude: -99.1784,
          schedules: [
            { dayOfWeek: 0, openTime: '13:00', closeTime: '22:00' },
            { dayOfWeek: 1, openTime: '12:00', closeTime: '23:00' },
            { dayOfWeek: 2, openTime: '12:00', closeTime: '23:00' },
            { dayOfWeek: 3, openTime: '12:00', closeTime: '23:00' },
            { dayOfWeek: 4, openTime: '12:00', closeTime: '23:00' },
            { dayOfWeek: 5, openTime: '12:00', closeTime: '00:00' },
            { dayOfWeek: 6, openTime: '12:00', closeTime: '00:00' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Restaurante creado',
    type: RestaurantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para crear restaurantes',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un restaurante con ese nombre',
  })
  async create(@Body() dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /restaurants/:restaurantId
  // ─────────────────────────────────────────────────────────────
  @Patch(':restaurantId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar restaurante',
    description: 'Actualiza la información de un restaurante (solo propietario o admin)',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
    description: 'ID del restaurante',
  })
  @ApiBody({
    type: UpdateRestaurantDto,
    examples: {
      actualizarDescripcion: {
        summary: 'Actualizar descripción',
        value: {
          description: 'Los mejores rolls y sashimi de la ciudad',
        },
      },
      actualizarContacto: {
        summary: 'Actualizar contacto',
        value: {
          phone: '+52 55 1111 2222',
          email: 'nuevo@sushimaster.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurante actualizado',
    type: RestaurantResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para modificar este restaurante',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurante no encontrado',
  })
  async update(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /restaurants/:restaurantId/images
  // ─────────────────────────────────────────────────────────────
  @Post(':restaurantId/images')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Subir imagen del restaurante',
    description: 'Sube el logo o imagen de portada del restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
    description: 'ID del restaurante',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['logo', 'cover'],
          description: 'Tipo de imagen',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (max 5MB)',
        },
      },
      required: ['type', 'image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen subida exitosamente',
    type: ImageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Formato no soportado o archivo muy grande',
  })
  async uploadImage(
    @Param('restaurantId') restaurantId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageResponseDto> {}
}
```

---

## 6. Categories Controller

```typescript
// src/modules/categories/categories.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
  CategoryResponseDto,
  MessageResponseDto,
} from './dto';

@ApiTags('Categories')
@Controller('restaurants/:restaurantId/categories')
export class CategoriesController {
  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/categories
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar categorías',
    description: 'Obtiene las categorías del menú de un restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
    description: 'ID del restaurante',
  })
  @ApiQuery({
    name: 'includeProducts',
    required: false,
    type: Boolean,
    description: 'Incluir productos de cada categoría',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Solo categorías activas',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías',
    type: [CategoryResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurante no encontrado',
  })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() query: any,
  ): Promise<CategoryResponseDto[]> {}

  // ─────────────────────────────────────────────────────────────
  // POST /restaurants/:restaurantId/categories
  // ─────────────────────────────────────────────────────────────
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear categoría',
    description: 'Crea una nueva categoría en el menú del restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
    description: 'ID del restaurante',
  })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      categoria: {
        summary: 'Nueva categoría',
        value: {
          name: 'Bebidas',
          description: 'Refrescos, jugos y bebidas calientes',
          displayOrder: 4,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para modificar este restaurante',
  })
  async create(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /restaurants/:restaurantId/categories/:categoryId
  // ─────────────────────────────────────────────────────────────
  @Patch(':categoryId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar categoría',
    description: 'Modifica una categoría existente',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
    description: 'ID del restaurante',
  })
  @ApiParam({
    name: 'categoryId',
    type: 'string',
    format: 'uuid',
    description: 'ID de la categoría',
  })
  @ApiBody({
    type: UpdateCategoryDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async update(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // DELETE /restaurants/:restaurantId/categories/:categoryId
  // ─────────────────────────────────────────────────────────────
  @Delete(':categoryId')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar categoría',
    description: 'Elimina una categoría (debe estar vacía)',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'categoryId',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Categoría eliminada',
  })
  @ApiResponse({
    status: 400,
    description: 'La categoría tiene productos asociados',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async remove(
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
  ): Promise<void> {}

  // ─────────────────────────────────────────────────────────────
  // PUT /restaurants/:restaurantId/categories/reorder
  // ─────────────────────────────────────────────────────────────
  @Put('reorder')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reordenar categorías',
    description: 'Cambia el orden de visualización de las categorías',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: ReorderCategoriesDto,
    examples: {
      reordenar: {
        value: {
          orderedIds: [
            'cat-001',
            'cat-003',
            'cat-002',
            'cat-004',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías reordenadas',
    type: MessageResponseDto,
  })
  async reorder(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: ReorderCategoriesDto,
  ): Promise<MessageResponseDto> {}
}
```

---

## 7. Products Controller

```typescript
// src/modules/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductsDto,
  UpdateAvailabilityDto,
  ProductResponseDto,
  ProductDetailResponseDto,
  MenuResponseDto,
  ImageResponseDto,
  PaginatedProductsResponseDto,
} from './dto';

@ApiTags('Products')
@Controller('restaurants/:restaurantId/products')
export class ProductsController {
  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/products
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar productos',
    description: 'Obtiene una lista paginada de productos del restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'isVegetarian', required: false, type: Boolean })
  @ApiQuery({ name: 'isVegan', required: false, type: Boolean })
  @ApiQuery({ name: 'isGlutenFree', required: false, type: Boolean })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['displayOrder', 'price', 'name', 'createdAt'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de productos',
    type: PaginatedProductsResponseDto,
  })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() query: QueryProductsDto,
  ): Promise<PaginatedProductsResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/menu
  // ─────────────────────────────────────────────────────────────
  @Get('menu')
  @ApiOperation({
    summary: 'Obtener menú completo',
    description: 'Obtiene todos los productos agrupados por categoría',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'availableOnly',
    required: false,
    type: Boolean,
    description: 'Solo productos disponibles',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Menú completo agrupado por categorías',
    type: MenuResponseDto,
  })
  async getMenu(
    @Param('restaurantId') restaurantId: string,
    @Query('availableOnly') availableOnly?: boolean,
  ): Promise<MenuResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/products/:productId
  // ─────────────────────────────────────────────────────────────
  @Get(':productId')
  @ApiOperation({
    summary: 'Obtener producto',
    description: 'Obtiene el detalle de un producto específico',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'productId',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle del producto',
    type: ProductDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async findOne(
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
  ): Promise<ProductDetailResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /restaurants/:restaurantId/products
  // ─────────────────────────────────────────────────────────────
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear producto',
    description: 'Agrega un nuevo producto al menú',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: CreateProductDto,
    examples: {
      producto: {
        summary: 'Nuevo producto',
        value: {
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Risotto ai Funghi',
          description: 'Arroz arborio cremoso con mix de hongos silvestres',
          price: 245.0,
          preparationTime: 25,
          calories: 520,
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: true,
          isFeatured: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o categoría no existe',
  })
  async create(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /restaurants/:restaurantId/products/:productId
  // ─────────────────────────────────────────────────────────────
  @Patch(':productId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar producto',
    description: 'Modifica un producto existente',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  @ApiBody({
    type: UpdateProductDto,
    examples: {
      actualizarPrecio: {
        summary: 'Actualizar precio',
        value: {
          price: 259.0,
          discountPrice: 229.0,
        },
      },
      destacar: {
        summary: 'Marcar como destacado',
        value: {
          isFeatured: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async update(
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /restaurants/:restaurantId/products/:productId/image
  // ─────────────────────────────────────────────────────────────
  @Post(':productId/image')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Subir imagen del producto',
    description: 'Sube o reemplaza la imagen de un producto',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del producto (max 5MB)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen subida',
    type: ImageResponseDto,
  })
  async uploadImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /restaurants/:restaurantId/products/:productId/availability
  // ─────────────────────────────────────────────────────────────
  @Patch(':productId/availability')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cambiar disponibilidad',
    description: 'Activa o desactiva un producto del menú',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  @ApiBody({
    type: UpdateAvailabilityDto,
    examples: {
      desactivar: {
        summary: 'Marcar como no disponible',
        value: { isAvailable: false },
      },
      activar: {
        summary: 'Marcar como disponible',
        value: { isAvailable: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad actualizada',
    type: ProductResponseDto,
  })
  async updateAvailability(
    @Param('productId') productId: string,
    @Body() dto: UpdateAvailabilityDto,
  ): Promise<ProductResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // DELETE /restaurants/:restaurantId/products/:productId
  // ─────────────────────────────────────────────────────────────
  @Delete(':productId')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar producto',
    description: 'Elimina un producto del menú',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'productId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Producto eliminado',
  })
  @ApiResponse({
    status: 400,
    description: 'Producto tiene pedidos activos asociados',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async remove(
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
  ): Promise<void> {}
}
```

---

## 8. Tables Controller

```typescript
// src/modules/tables/tables.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateTableDto,
  UpdateTableDto,
  QueryTablesDto,
  TableResponseDto,
} from './dto';

@ApiTags('Tables')
@ApiBearerAuth('JWT-auth')
@Controller('restaurants/:restaurantId/tables')
export class TablesController {
  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/tables
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar mesas',
    description: 'Obtiene las mesas del restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    type: Boolean,
    description: 'Filtrar por disponibilidad',
  })
  @ApiQuery({
    name: 'minCapacity',
    required: false,
    type: Number,
    description: 'Capacidad mínima',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Ubicación (terraza, interior, privado)',
    enum: ['interior', 'terraza', 'privado'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mesas',
    type: [TableResponseDto],
  })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() query: QueryTablesDto,
  ): Promise<TableResponseDto[]> {}

  // ─────────────────────────────────────────────────────────────
  // POST /restaurants/:restaurantId/tables
  // ─────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Crear mesa',
    description: 'Agrega una nueva mesa al restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: CreateTableDto,
    examples: {
      mesa: {
        summary: 'Nueva mesa',
        value: {
          tableNumber: '4',
          capacity: 8,
          location: 'privado',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mesa creada',
    type: TableResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una mesa con ese número',
  })
  async create(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateTableDto,
  ): Promise<TableResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /restaurants/:restaurantId/tables/:tableId
  // ─────────────────────────────────────────────────────────────
  @Patch(':tableId')
  @ApiOperation({
    summary: 'Actualizar mesa',
    description: 'Modifica los datos de una mesa',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'tableId', type: 'string', format: 'uuid' })
  @ApiBody({
    type: UpdateTableDto,
    examples: {
      capacidad: {
        summary: 'Cambiar capacidad',
        value: { capacity: 10 },
      },
      disponibilidad: {
        summary: 'Cambiar disponibilidad',
        value: { isAvailable: false },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mesa actualizada',
    type: TableResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Mesa no encontrada',
  })
  async update(
    @Param('tableId') tableId: string,
    @Body() dto: UpdateTableDto,
  ): Promise<TableResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // DELETE /restaurants/:restaurantId/tables/:tableId
  // ─────────────────────────────────────────────────────────────
  @Delete(':tableId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar mesa',
    description: 'Elimina una mesa del restaurante',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'tableId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Mesa eliminada',
  })
  @ApiResponse({
    status: 400,
    description: 'Mesa tiene reservaciones activas',
  })
  @ApiResponse({
    status: 404,
    description: 'Mesa no encontrada',
  })
  async remove(@Param('tableId') tableId: string): Promise<void> {}
}
```

---

## 9. Orders Controller (Cliente)

```typescript
// src/modules/orders/controllers/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateOrderDto,
  CancelOrderDto,
  QueryOrdersDto,
  OrderResponseDto,
  OrderDetailResponseDto,
  OrderTrackingResponseDto,
  PaginatedOrdersResponseDto,
} from './dto';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  // ─────────────────────────────────────────────────────────────
  // GET /orders
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar pedidos del usuario',
    description: 'Obtiene el historial de pedidos del usuario autenticado',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered', 'completed', 'cancelled'],
  })
  @ApiQuery({ name: 'restaurantId', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'fromDate', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'toDate', required: false, type: String, format: 'date' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'total'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de pedidos',
    type: PaginatedOrdersResponseDto,
  })
  async findAll(@Query() query: QueryOrdersDto): Promise<PaginatedOrdersResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // GET /orders/:orderId
  // ─────────────────────────────────────────────────────────────
  @Get(':orderId')
  @ApiOperation({
    summary: 'Obtener pedido',
    description: 'Obtiene el detalle completo de un pedido',
  })
  @ApiParam({
    name: 'orderId',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle del pedido',
    type: OrderDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado',
  })
  async findOne(@Param('orderId') orderId: string): Promise<OrderDetailResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /orders
  // ─────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Crear pedido',
    description: 'Crea un nuevo pedido (delivery, takeout o dine-in)',
  })
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      delivery: {
        summary: 'Pedido a domicilio',
        value: {
          restaurantId: '550e8400-e29b-41d4-a716-446655440000',
          orderType: 'delivery',
          addressId: '550e8400-e29b-41d4-a716-446655440001',
          paymentMethod: 'card',
          notes: 'Sin cebolla en la pasta, por favor',
          items: [
            { productId: 'prod-001', quantity: 1 },
            { productId: 'prod-002', quantity: 2, notes: 'Sin cebolla' },
          ],
        },
      },
      dineIn: {
        summary: 'Pedido en restaurante',
        value: {
          restaurantId: '550e8400-e29b-41d4-a716-446655440000',
          orderType: 'dine_in',
          tableId: 'table-003',
          items: [
            { productId: 'prod-003', quantity: 2 },
          ],
        },
      },
      takeout: {
        summary: 'Pedido para llevar',
        value: {
          restaurantId: '550e8400-e29b-41d4-a716-446655440000',
          orderType: 'takeout',
          items: [
            { productId: 'prod-001', quantity: 3 },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, productos no disponibles o restaurante cerrado',
    schema: {
      examples: {
        productoNoDisponible: {
          value: {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Algunos productos no están disponibles',
              details: [
                { productId: 'prod-001', message: 'Producto no disponible' },
              ],
            },
          },
        },
        restauranteCerrado: {
          value: {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'El restaurante está cerrado en este momento',
            },
          },
        },
      },
    },
  })
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /orders/:orderId/cancel
  // ─────────────────────────────────────────────────────────────
  @Post(':orderId/cancel')
  @ApiOperation({
    summary: 'Cancelar pedido',
    description: 'Cancela un pedido pendiente o confirmado',
  })
  @ApiParam({
    name: 'orderId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: CancelOrderDto,
    examples: {
      cancelar: {
        value: {
          reason: 'Tiempo de espera muy largo',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido cancelado',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El pedido no puede ser cancelado (ya preparado o entregado)',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado',
  })
  async cancel(
    @Param('orderId') orderId: string,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // GET /orders/:orderId/tracking
  // ─────────────────────────────────────────────────────────────
  @Get(':orderId/tracking')
  @ApiOperation({
    summary: 'Seguimiento del pedido',
    description: 'Obtiene el estado actual y timeline del pedido',
  })
  @ApiParam({
    name: 'orderId',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de seguimiento del pedido',
    type: OrderTrackingResponseDto,
    example: {
      success: true,
      data: {
        orderId: 'order-002',
        orderNumber: 'ORD-20240121-000001',
        status: 'preparing',
        estimatedDeliveryTime: '2024-01-21T12:45:00Z',
        currentStep: 2,
        steps: [
          { step: 1, name: 'Pedido recibido', status: 'completed', completedAt: '2024-01-21T12:00:00Z' },
          { step: 2, name: 'Preparando', status: 'in_progress', startedAt: '2024-01-21T12:05:00Z' },
          { step: 3, name: 'Listo para entrega', status: 'pending' },
          { step: 4, name: 'En camino', status: 'pending' },
          { step: 5, name: 'Entregado', status: 'pending' },
        ],
      },
    },
  })
  async tracking(@Param('orderId') orderId: string): Promise<OrderTrackingResponseDto> {}
}
```

---

## 10. Restaurant Orders Controller

```typescript
// src/modules/orders/controllers/restaurant-orders.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  UpdateOrderStatusDto,
  QueryOrdersDto,
  OrderResponseDto,
  OrdersDashboardResponseDto,
  PaginatedOrdersResponseDto,
} from './dto';

@ApiTags('Restaurant Orders')
@ApiBearerAuth('JWT-auth')
@Controller('restaurants/:restaurantId/orders')
export class RestaurantOrdersController {
  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/orders
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar pedidos del restaurante',
    description: 'Obtiene los pedidos recibidos por el restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered', 'completed', 'cancelled'],
  })
  @ApiQuery({
    name: 'orderType',
    required: false,
    enum: ['dine_in', 'takeout', 'delivery'],
  })
  @ApiQuery({ name: 'fromDate', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'toDate', required: false, type: String, format: 'date' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos',
    type: PaginatedOrdersResponseDto,
  })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() query: QueryOrdersDto,
  ): Promise<PaginatedOrdersResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/orders/dashboard
  // ─────────────────────────────────────────────────────────────
  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard de pedidos',
    description: 'Obtiene un resumen en tiempo real de los pedidos activos',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard de pedidos',
    type: OrdersDashboardResponseDto,
    example: {
      success: true,
      data: {
        summary: {
          pending: 3,
          confirmed: 2,
          preparing: 5,
          ready: 1,
          onTheWay: 2,
          todayTotal: 45,
          todayRevenue: 28500.0,
        },
        activeOrders: [
          {
            id: 'order-002',
            orderNumber: 'ORD-20240121-000001',
            status: 'preparing',
            orderType: 'delivery',
            elapsedMinutes: 15,
            estimatedTime: 40,
            items: [
              { name: 'Bruschetta Clásica', quantity: 1 },
              { name: 'Pasta Carbonara', quantity: 2 },
            ],
          },
        ],
      },
    },
  })
  async dashboard(
    @Param('restaurantId') restaurantId: string,
  ): Promise<OrdersDashboardResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /restaurants/:restaurantId/orders/:orderId/status
  // ─────────────────────────────────────────────────────────────
  @Patch(':orderId/status')
  @ApiOperation({
    summary: 'Actualizar estado del pedido',
    description: 'Cambia el estado de un pedido siguiendo el flujo permitido',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'orderId', type: 'string', format: 'uuid' })
  @ApiBody({
    type: UpdateOrderStatusDto,
    examples: {
      confirmar: {
        summary: 'Confirmar pedido',
        value: {
          status: 'confirmed',
          estimatedTime: 40,
        },
      },
      preparando: {
        summary: 'Iniciar preparación',
        value: {
          status: 'preparing',
        },
      },
      listo: {
        summary: 'Marcar como listo',
        value: {
          status: 'ready',
        },
      },
      enCamino: {
        summary: 'En camino (delivery)',
        value: {
          status: 'on_the_way',
        },
      },
      entregado: {
        summary: 'Marcar como entregado',
        value: {
          status: 'delivered',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no permitida',
    schema: {
      example: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No se puede cambiar de pending a delivered',
        },
      },
    },
  })
  async updateStatus(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {}
}
```

---

## 11. Reservations Controller (Cliente)

```typescript
// src/modules/reservations/controllers/reservations.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateReservationDto,
  CancelReservationDto,
  QueryReservationsDto,
  ReservationResponseDto,
  PaginatedReservationsResponseDto,
} from './dto';

@ApiTags('Reservations')
@ApiBearerAuth('JWT-auth')
@Controller('reservations')
export class ReservationsController {
  // ─────────────────────────────────────────────────────────────
  // GET /reservations
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar reservaciones del usuario',
    description: 'Obtiene el historial de reservaciones del usuario',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'],
  })
  @ApiQuery({ name: 'fromDate', required: false, type: String, format: 'date' })
  @ApiQuery({
    name: 'upcoming',
    required: false,
    type: Boolean,
    description: 'Solo reservaciones futuras',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reservaciones',
    type: PaginatedReservationsResponseDto,
  })
  async findAll(@Query() query: QueryReservationsDto): Promise<PaginatedReservationsResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /reservations
  // ─────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({
    summary: 'Crear reservación',
    description: 'Crea una nueva reservación en un restaurante',
  })
  @ApiBody({
    type: CreateReservationDto,
    examples: {
      reservacion: {
        summary: 'Nueva reservación',
        value: {
          restaurantId: '550e8400-e29b-41d4-a716-446655440000',
          partySize: 4,
          reservationDate: '2024-01-25',
          reservationTime: '20:00',
          notes: 'Celebración de cumpleaños, si es posible mesa en terraza',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reservación creada',
    type: ReservationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No hay disponibilidad o restaurante cerrado',
  })
  async create(@Body() dto: CreateReservationDto): Promise<ReservationResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /reservations/:reservationId/cancel
  // ─────────────────────────────────────────────────────────────
  @Post(':reservationId/cancel')
  @ApiOperation({
    summary: 'Cancelar reservación',
    description: 'Cancela una reservación pendiente o confirmada',
  })
  @ApiParam({
    name: 'reservationId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: CancelReservationDto,
    examples: {
      cancelar: {
        value: {
          reason: 'Cambio de planes',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reservación cancelada',
    type: ReservationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar (muy cercana a la hora)',
  })
  async cancel(
    @Param('reservationId') reservationId: string,
    @Body() dto: CancelReservationDto,
  ): Promise<ReservationResponseDto> {}
}
```

---

## 12. Restaurant Reservations Controller

```typescript
// src/modules/reservations/controllers/restaurant-reservations.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  QueryAvailabilityDto,
  QueryReservationsDto,
  ConfirmReservationDto,
  UpdateReservationStatusDto,
  AvailabilityResponseDto,
  ReservationResponseDto,
} from './dto';

@ApiTags('Restaurant Reservations')
@Controller('restaurants/:restaurantId/reservations')
export class RestaurantReservationsController {
  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/reservations/availability
  // ─────────────────────────────────────────────────────────────
  @Get('availability')
  @ApiOperation({
    summary: 'Verificar disponibilidad',
    description: 'Consulta los horarios disponibles para una fecha y cantidad de personas',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    format: 'date',
    description: 'Fecha de la reservación (YYYY-MM-DD)',
    example: '2024-01-25',
  })
  @ApiQuery({
    name: 'partySize',
    required: true,
    type: Number,
    description: 'Número de personas',
    example: 4,
  })
  @ApiQuery({
    name: 'time',
    required: false,
    type: String,
    description: 'Hora específica (HH:mm)',
    example: '20:00',
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidad de horarios',
    type: AvailabilityResponseDto,
    example: {
      success: true,
      data: {
        date: '2024-01-25',
        partySize: 4,
        availableSlots: [
          { time: '13:00', tablesAvailable: 3 },
          { time: '13:30', tablesAvailable: 2 },
          { time: '20:00', tablesAvailable: 1 },
          { time: '20:30', tablesAvailable: 2 },
        ],
      },
    },
  })
  async checkAvailability(
    @Param('restaurantId') restaurantId: string,
    @Query() query: QueryAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/reservations
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar reservaciones del restaurante',
    description: 'Obtiene las reservaciones del restaurante (solo propietario)',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    format: 'date',
    description: 'Fecha específica (por defecto: hoy)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de reservaciones',
    type: [ReservationResponseDto],
  })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() query: QueryReservationsDto,
  ): Promise<ReservationResponseDto[]> {}

  // ─────────────────────────────────────────────────────────────
  // POST /restaurants/:restaurantId/reservations/:reservationId/confirm
  // ─────────────────────────────────────────────────────────────
  @Post(':reservationId/confirm')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Confirmar reservación',
    description: 'Confirma una reservación y asigna una mesa',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'reservationId', type: 'string', format: 'uuid' })
  @ApiBody({
    type: ConfirmReservationDto,
    examples: {
      confirmar: {
        value: {
          tableId: 'table-005',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reservación confirmada',
    type: ReservationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Mesa no disponible para ese horario',
  })
  async confirm(
    @Param('reservationId') reservationId: string,
    @Body() dto: ConfirmReservationDto,
  ): Promise<ReservationResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /restaurants/:restaurantId/reservations/:reservationId/status
  // ─────────────────────────────────────────────────────────────
  @Patch(':reservationId/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar estado de reservación',
    description: 'Cambia el estado de una reservación (seated, completed, no_show)',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'reservationId', type: 'string', format: 'uuid' })
  @ApiBody({
    type: UpdateReservationStatusDto,
    examples: {
      seated: {
        summary: 'Cliente llegó',
        value: { status: 'seated' },
      },
      completed: {
        summary: 'Reservación completada',
        value: { status: 'completed' },
      },
      noShow: {
        summary: 'Cliente no llegó',
        value: { status: 'no_show' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
    type: ReservationResponseDto,
  })
  async updateStatus(
    @Param('reservationId') reservationId: string,
    @Body() dto: UpdateReservationStatusDto,
  ): Promise<ReservationResponseDto> {}
}
```

---

## 13. Reviews Controllers

```typescript
// src/modules/reviews/controllers/reviews.controller.ts
import {
  Controller,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateReviewDto, ReviewResponseDto } from './dto';

@ApiTags('Reviews')
@ApiBearerAuth('JWT-auth')
@Controller('reviews')
export class ReviewsController {
  // ─────────────────────────────────────────────────────────────
  // PATCH /reviews/:reviewId
  // ─────────────────────────────────────────────────────────────
  @Patch(':reviewId')
  @ApiOperation({
    summary: 'Actualizar reseña',
    description: 'Modifica una reseña propia',
  })
  @ApiParam({
    name: 'reviewId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateReviewDto,
    examples: {
      actualizar: {
        value: {
          rating: 4,
          comment: 'Actualizo mi reseña: la comida sigue siendo excelente pero el servicio ha decaído.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reseña actualizada',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para editar esta reseña',
  })
  @ApiResponse({
    status: 404,
    description: 'Reseña no encontrada',
  })
  async update(
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // DELETE /reviews/:reviewId
  // ─────────────────────────────────────────────────────────────
  @Delete(':reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar reseña',
    description: 'Elimina una reseña propia',
  })
  @ApiParam({
    name: 'reviewId',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Reseña eliminada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar esta reseña',
  })
  async remove(@Param('reviewId') reviewId: string): Promise<void> {}
}

// src/modules/reviews/controllers/restaurant-reviews.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateReviewDto,
  RespondReviewDto,
  QueryReviewsDto,
  ReviewResponseDto,
  ReviewsWithSummaryDto,
} from './dto';

@ApiTags('Reviews')
@Controller('restaurants/:restaurantId/reviews')
export class RestaurantReviewsController {
  // ─────────────────────────────────────────────────────────────
  // GET /restaurants/:restaurantId/reviews
  // ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Listar reseñas del restaurante',
    description: 'Obtiene las reseñas con resumen de calificaciones',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'rating',
    required: false,
    type: Number,
    description: 'Filtrar por rating (1-5)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'rating'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Reseñas con resumen',
    type: ReviewsWithSummaryDto,
  })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() query: QueryReviewsDto,
  ): Promise<ReviewsWithSummaryDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /restaurants/:restaurantId/reviews
  // ─────────────────────────────────────────────────────────────
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear reseña',
    description: 'Publica una reseña para el restaurante',
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: CreateReviewDto,
    examples: {
      resena: {
        summary: 'Nueva reseña',
        value: {
          orderId: 'order-001',
          rating: 5,
          title: 'Excelente experiencia',
          comment: 'La pasta carbonara es increíble, auténtico sabor italiano.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reseña creada',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe una reseña o el pedido no está completado',
  })
  async create(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // POST /restaurants/:restaurantId/reviews/:reviewId/response
  // ─────────────────────────────────────────────────────────────
  @Post(':reviewId/response')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Responder a reseña',
    description: 'El restaurante responde a una reseña (solo propietario)',
  })
  @ApiParam({ name: 'restaurantId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'reviewId', type: 'string', format: 'uuid' })
  @ApiBody({
    type: RespondReviewDto,
    examples: {
      respuesta: {
        value: {
          response: 'Gracias por tu feedback. Lamentamos que la experiencia no haya sido perfecta.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta agregada',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para responder',
  })
  async respond(
    @Param('reviewId') reviewId: string,
    @Body() dto: RespondReviewDto,
  ): Promise<ReviewResponseDto> {}
}
```

---

## 14. Admin Controller

```typescript
// src/modules/admin/admin.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  QueryUsersDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UserResponseDto,
  DashboardResponseDto,
  PaginatedUsersResponseDto,
} from './dto';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
export class AdminController {
  // ─────────────────────────────────────────────────────────────
  // GET /admin/users
  // ─────────────────────────────────────────────────────────────
  @Get('users')
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene una lista paginada de todos los usuarios (solo admin)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['customer', 'employee', 'manager', 'admin'],
  })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre o email' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Solo administradores',
  })
  async findAllUsers(@Query() query: QueryUsersDto): Promise<PaginatedUsersResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /admin/users/:userId/role
  // ─────────────────────────────────────────────────────────────
  @Patch('users/:userId/role')
  @ApiOperation({
    summary: 'Actualizar rol de usuario',
    description: 'Cambia el rol de un usuario',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateUserRoleDto,
    examples: {
      manager: {
        summary: 'Promover a manager',
        value: { role: 'manager' },
      },
      employee: {
        summary: 'Asignar como empleado',
        value: { role: 'employee' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No puedes cambiar tu propio rol',
  })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // PATCH /admin/users/:userId/status
  // ─────────────────────────────────────────────────────────────
  @Patch('users/:userId/status')
  @ApiOperation({
    summary: 'Activar/desactivar usuario',
    description: 'Activa o desactiva la cuenta de un usuario',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateUserStatusDto,
    examples: {
      desactivar: {
        summary: 'Desactivar cuenta',
        value: { isActive: false },
      },
      activar: {
        summary: 'Activar cuenta',
        value: { isActive: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
    type: UserResponseDto,
  })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {}

  // ─────────────────────────────────────────────────────────────
  // GET /admin/dashboard
  // ─────────────────────────────────────────────────────────────
  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard general',
    description: 'Obtiene métricas y estadísticas del sistema',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Período de tiempo para las métricas',
    example: 'week',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas del dashboard',
    type: DashboardResponseDto,
    example: {
      success: true,
      data: {
        period: 'week',
        users: {
          total: 12500,
          new: 245,
          active: 8900,
        },
        restaurants: {
          total: 156,
          active: 142,
        },
        orders: {
          total: 3456,
          revenue: 485000.0,
          averageTicket: 140.35,
          byStatus: {
            completed: 3100,
            cancelled: 156,
            pending: 200,
          },
        },
        reservations: {
          total: 890,
          completed: 756,
          noShow: 45,
        },
        topRestaurants: [
          {
            id: 'rest-001',
            name: 'La Trattoria Italiana',
            orders: 245,
            revenue: 48500.0,
          },
        ],
      },
    },
  })
  async dashboard(
    @Query('period') period: 'day' | 'week' | 'month' | 'year',
  ): Promise<DashboardResponseDto> {}
}
```

---

## 15. DTOs con Decoradores Swagger

### 15.1 Response DTOs Base

```typescript
// src/common/dto/api-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MetaDto {
  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  timestamp: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  requestId?: string;
}

export class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 8 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operación realizada exitosamente' })
  message: string;
}

export class ImageResponseDto {
  @ApiProperty({ example: 'https://cdn.example.com/images/abc123.jpg' })
  imageUrl: string;

  @ApiPropertyOptional({ enum: ['logo', 'cover', 'product', 'avatar'] })
  type?: string;
}
```

### 15.2 Auth DTOs

```typescript
// src/modules/auth/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Contraseña (min 8 caracteres, mayúscula, minúscula, número, símbolo)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  password: string;

  @ApiProperty({
    description: 'Nombre',
    example: 'Juan',
    minLength: 2,
    maxLength: 100,
  })
  firstName: string;

  @ApiProperty({
    description: 'Apellido',
    example: 'Pérez',
    minLength: 2,
    maxLength: 100,
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+52 55 1234 5678',
  })
  phone?: string;
}

// src/modules/auth/dto/auth-response.dto.ts
export class TokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  refreshToken: string;

  @ApiProperty({ example: 3600, description: 'Tiempo de expiración en segundos' })
  expiresIn: number;
}

export class AuthResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: () => TokensDto })
  tokens: TokensDto;
}
```

### 15.3 Order DTOs

```typescript
// src/modules/orders/dto/create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID del producto',
    format: 'uuid',
  })
  productId: string;

  @ApiProperty({
    description: 'Cantidad',
    minimum: 1,
    maximum: 99,
    example: 2,
  })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Notas especiales para este item',
    example: 'Sin cebolla',
  })
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ format: 'uuid' })
  restaurantId: string;

  @ApiProperty({
    enum: ['dine_in', 'takeout', 'delivery'],
    description: 'Tipo de pedido',
  })
  orderType: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'ID de dirección (requerido para delivery)',
  })
  addressId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'ID de mesa (requerido para dine_in)',
  })
  tableId?: string;

  @ApiPropertyOptional({
    description: 'Método de pago',
    enum: ['card', 'cash', 'transfer'],
  })
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Notas generales del pedido',
    maxLength: 500,
  })
  notes?: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Lista de productos',
  })
  items: CreateOrderItemDto[];
}

// src/modules/orders/dto/order-response.dto.ts
export class OrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'ORD-20240121-000001' })
  orderNumber: string;

  @ApiProperty({
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered', 'completed', 'cancelled'],
  })
  status: string;

  @ApiProperty({ enum: ['dine_in', 'takeout', 'delivery'] })
  orderType: string;

  @ApiProperty({ example: 409.0 })
  subtotal: number;

  @ApiProperty({ example: 65.44 })
  tax: number;

  @ApiProperty({ example: 35.0 })
  deliveryFee: number;

  @ApiProperty({ example: 0 })
  discount: number;

  @ApiProperty({ example: 509.44 })
  total: number;

  @ApiProperty({ enum: ['pending', 'paid', 'refunded', 'failed'] })
  paymentStatus: string;

  @ApiProperty({ type: () => RestaurantSummaryDto })
  restaurant: RestaurantSummaryDto;

  @ApiProperty({ example: 3 })
  itemCount: number;

  @ApiProperty({ example: '2024-01-21T12:00:00Z' })
  createdAt: string;
}
```

---

## 16. Decorador Personalizado para Respuestas Paginadas

```typescript
// src/common/decorators/api-paginated-response.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationDto } from '../dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(PaginationDto, model),
    ApiOkResponse({
      description: 'Lista paginada',
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              pagination: { $ref: getSchemaPath(PaginationDto) },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string', example: '2024-01-15T10:30:00Z' },
                },
              },
            },
          },
        ],
      },
    }),
  );

// Uso en controlador:
// @ApiPaginatedResponse(RestaurantResponseDto)
// async findAll(): Promise<PaginatedResult<RestaurantResponseDto>> {}
```

---

## 17. Resumen de Decoradores por Endpoint

| Módulo | Endpoints | Decoradores Usados |
|--------|-----------|-------------------|
| Auth | 6 | @ApiTags, @ApiOperation, @ApiBody, @ApiResponse, @ApiBearerAuth |
| Users | 4 | @ApiTags, @ApiBearerAuth, @ApiConsumes, @ApiBody (multipart) |
| Addresses | 5 | @ApiTags, @ApiBearerAuth, @ApiParam, @ApiBody |
| Restaurants | 5 | @ApiTags, @ApiQuery (múltiples), @ApiParam, @ApiBearerAuth |
| Categories | 5 | @ApiTags, @ApiParam (anidados), @ApiBody |
| Products | 8 | @ApiTags, @ApiQuery (filtros), @ApiConsumes, @ApiParam |
| Tables | 4 | @ApiTags, @ApiBearerAuth, @ApiQuery, @ApiParam |
| Orders | 5 | @ApiTags, @ApiBearerAuth, @ApiBody (ejemplos múltiples) |
| Restaurant Orders | 3 | @ApiTags, @ApiParam, @ApiBody (estados) |
| Reservations | 3 | @ApiTags, @ApiBearerAuth, @ApiBody |
| Restaurant Reservations | 4 | @ApiTags, @ApiQuery, @ApiParam |
| Reviews | 5 | @ApiTags, @ApiParam, @ApiBody |
| Admin | 4 | @ApiTags, @ApiBearerAuth, @ApiQuery, @ApiParam |

**Total: 61 endpoints documentados**

---

*Documento de decoradores Swagger para el sistema de gestión de restaurantes.*

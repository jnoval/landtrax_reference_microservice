import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { CategoryController } from '../src/domains/category/controllers/category.controller';
import { CategoryService } from '../src/domains/category/services/category.service';
import { FAQController } from '../src/domains/faq/controllers/faq.controller';
import { FAQService } from '../src/domains/faq/services/faq.service';
import { LocationController } from '../src/domains/location/controllers/location.controller';
import { LocationService } from '../src/domains/location/services/location.service';
import { RequirementController } from '../src/domains/requirement/controllers/requirement.controller';
import { RequirementService } from '../src/domains/requirement/services/requirement.service';
import { RequirementMappingController } from '../src/domains/service-catalog/controllers/requirement-mapping.controller';
import { ServiceChecklistController } from '../src/domains/service-catalog/controllers/service-checklist.controller';
import { ServiceCatalogController } from '../src/domains/service-catalog/controllers/service.controller';
import { RequirementMappingService } from '../src/domains/service-catalog/services/requirement-mapping.service';
import { ServiceChecklistService } from '../src/domains/service-catalog/services/service-checklist.service';
import { ServiceCatalogService } from '../src/domains/service-catalog/services/service.service';
import { SystemSettingsController } from '../src/domains/system-settings/controllers/system-settings.controller';
import { SystemSettingsService } from '../src/domains/system-settings/services/system-settings.service';
import { AuditTrailService } from '../src/shared/contracts/audit-trail.service.abstract';
import { HttpExceptionFilter } from '../src/shared/filters/http-exception.filter';
import { GatewayUserGuard } from '../src/shared/guards/gateway-user.guard';
import { PermissionGuard } from '../src/shared/guards/permission.guard';
import { CategoryEntity } from '../src/shared/infrastructure/database/entities/category.entity';
import { FAQEntity } from '../src/shared/infrastructure/database/entities/faq.entity';
import { RegistryOfDeedEntity } from '../src/shared/infrastructure/database/entities/registry-of-deed.entity';
import { RequirementMappingEntity } from '../src/shared/infrastructure/database/entities/requirement-mapping.entity';
import { RequirementEntity } from '../src/shared/infrastructure/database/entities/requirement.entity';
import { ServiceEntity } from '../src/shared/infrastructure/database/entities/service-catalog.entity';
import { ServiceChecklistEntity } from '../src/shared/infrastructure/database/entities/service-checklist.entity';
import { SystemSettingEntity } from '../src/shared/infrastructure/database/entities/system-setting.entity';
import { RedisCacheService } from '../src/shared/infrastructure/redis/redis-cache.service';

describe('Reference Microservice (e2e)', () => {
  let app: INestApplication;

  const mockQueryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    select: jest.fn().mockReturnThis(),
  };

  const mockRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'mock-id-1', ...entity })),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockRedisService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    delByPattern: jest.fn().mockResolvedValue(undefined),
  };

  const mockAuditTrailService = {
    create: jest.fn().mockResolvedValue({ success: true }),
    getUserAuditTrail: jest.fn().mockResolvedValue([]),
  };

  const gatewaySecret = 'test-gateway-secret';
  const gatewayHeaders = {
    'x-gateway-secret': gatewaySecret,
    'x-user-id': 'user-uuid-1',
    'x-user-role': 'admin',
    'x-user-type': 'staff',
    'x-user-permissions': [
      'View Service Catalog',
      'View Services Catalogs',
      'Create Service Catalog',
      'Edit Service Catalog',
      'Delete Service Catalog',
      'View Location',
      'Create Location',
      'Edit Location',
      'Delete Location',
      'View System Settings',
      'View Settings Configuration',
      'Edit Settings Configuration',
      'View Requirement',
      'Create Requirement',
      'Edit Requirement',
      'Delete Requirement',
      'View FAQ',
      'View FAQ Management Page',
      'Create FAQ',
      'Edit FAQ',
      'Delete FAQ',
      'View Service Category',
      'Create Service Category',
      'Edit Service Category',
      'Delete Service Category',
    ].join(','),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AppController,
        CategoryController,
        ServiceCatalogController,
        ServiceChecklistController,
        RequirementMappingController,
        RequirementController,
        SystemSettingsController,
        LocationController,
        FAQController,
      ],
      providers: [
        Reflector,
        AppService,
        CategoryService,
        ServiceCatalogService,
        ServiceChecklistService,
        RequirementMappingService,
        RequirementService,
        SystemSettingsService,
        LocationService,
        FAQService,
        { provide: getRepositoryToken(CategoryEntity), useValue: mockRepo },
        { provide: getRepositoryToken(ServiceEntity), useValue: mockRepo },
        { provide: getRepositoryToken(ServiceChecklistEntity), useValue: mockRepo },
        { provide: getRepositoryToken(RequirementEntity), useValue: mockRepo },
        { provide: getRepositoryToken(RequirementMappingEntity), useValue: mockRepo },
        { provide: getRepositoryToken(SystemSettingEntity), useValue: mockRepo },
        { provide: getRepositoryToken(RegistryOfDeedEntity), useValue: mockRepo },
        { provide: getRepositoryToken(FAQEntity), useValue: mockRepo },
        { provide: RedisCacheService, useValue: mockRedisService },
        { provide: AuditTrailService, useValue: mockAuditTrailService },
        { provide: APP_GUARD, useClass: GatewayUserGuard },
        { provide: APP_GUARD, useClass: PermissionGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health Check', () => {
    it('/health (GET) should return 200 with service info (public route)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.service).toBe('reference-microservice');
        });
    });
  });

  describe('Security & Gateway Authentication', () => {
    it('rejects protected routes without x-gateway-secret (401)', () => {
      return request(app.getHttpServer())
        .get('/service')
        .expect(401);
    });

    it('rejects protected routes with wrong x-gateway-secret (401)', () => {
      return request(app.getHttpServer())
        .get('/service')
        .set('x-gateway-secret', 'wrong-secret')
        .expect(401);
    });

    it('allows requests through with valid x-gateway-secret and x-user-data', () => {
      return request(app.getHttpServer())
        .get('/service')
        .set(gatewayHeaders)
        .expect(200);
    });
  });

  describe('Service Catalog Endpoints', () => {
    it('/service (GET) returns paginated list of services', () => {
      return request(app.getHttpServer())
        .get('/service')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/service-checklist (GET) returns list of checklists', () => {
      return request(app.getHttpServer())
        .get('/service-checklist')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('/requirement-mapping (GET) returns requirement mappings', () => {
      return request(app.getHttpServer())
        .get('/requirement-mapping')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('Requirement Endpoints', () => {
    it('/requirement (GET) returns requirements', () => {
      return request(app.getHttpServer())
        .get('/requirement')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('/requirement/active (GET) returns active requirements without GUID errors', () => {
      return request(app.getHttpServer())
        .get('/requirement/active?page=1&limit=10')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.meta).toBeDefined();
        });
    });
  });

  describe('System Settings Endpoints', () => {
    it('/system-settings (GET) returns system settings', () => {
      return request(app.getHttpServer())
        .get('/system-settings')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('/system-settings (POST) rejects invalid payload with 400', () => {
      return request(app.getHttpServer())
        .post('/system-settings')
        .set(gatewayHeaders)
        .send({ invalidField: 123 })
        .expect(400);
    });
  });

  describe('Location (Registry of Deed) Endpoints', () => {
    it('/registry-of-deed (GET) returns locations', () => {
      return request(app.getHttpServer())
        .get('/registry-of-deed')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/registry-of-deed/active (GET) returns active lookup', () => {
      return request(app.getHttpServer())
        .get('/registry-of-deed/active')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('FAQ Endpoints', () => {
    it('/faq (GET) returns faq list', () => {
      return request(app.getHttpServer())
        .get('/faq')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/faq (POST) validates payload requirement and rejects empty body with 400', () => {
      return request(app.getHttpServer())
        .post('/faq')
        .set(gatewayHeaders)
        .send({})
        .expect(400);
    });
  });

  describe('Category Endpoints', () => {
    it('/category (GET) returns paginated list of categories', () => {
      return request(app.getHttpServer())
        .get('/category')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.meta).toBeDefined();
        });
    });

    it('/category/get-all (GET) returns all categories array without pagination', () => {
      return request(app.getHttpServer())
        .get('/category/get-all')
        .set(gatewayHeaders)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/category (POST) validates payload requirement and rejects empty body with 400', () => {
      return request(app.getHttpServer())
        .post('/category')
        .set(gatewayHeaders)
        .send({})
        .expect(400);
    });
  });
});

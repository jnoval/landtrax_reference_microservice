import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  it('should return health status', async () => {
    const health = await appController.getHealth();
    expect(health).toHaveProperty('status', 'ok');
    expect(health).toHaveProperty('service', 'reference-microservice');
    expect(health).toHaveProperty('app', 'Reference Microservice');
    expect(health).toHaveProperty('version');
    expect(health).toHaveProperty('commitSha');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('uptime');
  });

  it('should return version information', () => {
    const version = appController.getVersion();
    expect(version).toHaveProperty('service', 'reference-microservice');
    expect(version).toHaveProperty('app', 'Reference Microservice');
    expect(version).toHaveProperty('version');
    expect(version).toHaveProperty('commitSha');
    expect(version).toHaveProperty('timestamp');
  });
});

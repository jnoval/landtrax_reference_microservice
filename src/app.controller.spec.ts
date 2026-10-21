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

  it('should return health status', () => {
    const health = appController.getHealth();
    expect(health).toHaveProperty('status', 'ok');
    expect(health).toHaveProperty('service', 'reference-microservice');
    expect(health).toHaveProperty('version');
    expect(health).toHaveProperty('timestamp');
  });
});

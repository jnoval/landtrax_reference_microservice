import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import FAQEntity from '../../shared/infrastructure/database/entities/faq.entity';
import { FAQController } from './controllers/faq.controller';
import { FAQService } from './services/faq.service';

@Module({
  imports: [TypeOrmModule.forFeature([FAQEntity])],
  controllers: [FAQController],
  providers: [FAQService],
  exports: [FAQService],
})
export class FAQModule {}

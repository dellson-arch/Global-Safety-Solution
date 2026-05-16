import { Module } from '@nestjs/common';
import { ServiceProductsService } from './service-products.service';
import { ServiceProductsController } from './service-products.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceProductsController],
  providers: [ServiceProductsService],
  exports: [ServiceProductsService],
})
export class ServiceProductsModule {}

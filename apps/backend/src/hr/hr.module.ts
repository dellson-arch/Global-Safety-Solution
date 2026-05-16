import { Module } from '@nestjs/common';
import { HRService } from './hr.service';
import { HRController } from './hr.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HRController],
  providers: [HRService],
  exports: [HRService],
})
export class HRModule {}

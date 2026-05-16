import { Module } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { RBACController } from './rbac.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [RBACController],
  providers: [RBACService],
  exports: [RBACService],
})
export class RBACModule {}

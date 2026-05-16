import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('READ_USER')
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @Permissions('UPDATE_USER')
  updateProfile(@Param('id') id: string, @Body() data: any) {
    return this.usersService.updateProfile(id, data);
  }

  @Post()
  @Permissions('CREATE_USER')
  create(@Body() data: any) {
    return this.usersService.create(data);
  }

  @Get(':id/profile')
  @Permissions('READ_USER')
  getProfile(@Param('id') id: string) {
    return this.usersService.getEmployeeProfile(id);
  }
}

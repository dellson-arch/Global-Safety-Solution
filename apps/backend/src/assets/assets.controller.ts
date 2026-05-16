import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @Permissions('READ_ASSET')
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  @Permissions('READ_ASSET')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Post()
  @Permissions('CREATE_ASSET')
  create(@Body() data: any) {
    return this.assetsService.create(data);
  }

  @Patch(':id')
  @Permissions('UPDATE_ASSET')
  update(@Param('id') id: string, @Body() data: any) {
    return this.assetsService.update(id, data);
  }

  @Delete(':id')
  @Permissions('DELETE_ASSET')
  delete(@Param('id') id: string) {
    return this.assetsService.delete(id);
  }
}

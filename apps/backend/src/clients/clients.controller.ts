import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Permissions('CREATE_CLIENT')
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @Permissions('READ_CLIENT')
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Permissions('READ_CLIENT')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('UPDATE_CLIENT')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    console.log(
      `[ClientsController] PATCH request received for id: ${id}`,
      updateClientDto,
    );
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Permissions('DELETE_CLIENT')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}

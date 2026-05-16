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
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';

@Controller('compliance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post()
  @Permissions('CREATE_COMPLIANCE')
  create(@Body() createComplianceDto: CreateComplianceDto) {
    return this.complianceService.create(createComplianceDto);
  }

  @Get()
  @Permissions('READ_COMPLIANCE')
  findAll() {
    return this.complianceService.findAll();
  }

  @Get(':id')
  @Permissions('READ_COMPLIANCE')
  findOne(@Param('id') id: string) {
    return this.complianceService.findOne(id);
  }

  @Patch(':id')
  @Permissions('UPDATE_COMPLIANCE')
  update(
    @Param('id') id: string,
    @Body() updateComplianceDto: UpdateComplianceDto,
  ) {
    return this.complianceService.update(id, updateComplianceDto);
  }

  @Delete(':id')
  @Permissions('DELETE_COMPLIANCE')
  remove(@Param('id') id: string) {
    return this.complianceService.remove(id);
  }
}

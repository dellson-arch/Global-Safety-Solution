import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@Request() req: any, @Body('location') location: string) {
    return this.attendanceService.checkIn(req.user.userId, location);
  }

  @Post('check-out')
  checkOut(@Request() req: any, @Body('location') location: string) {
    return this.attendanceService.checkOut(req.user.userId, location);
  }

  @Get('my')
  getMyAttendance(@Request() req: any) {
    return this.attendanceService.getAttendance(req.user.userId);
  }

  @Get('all')
  getAllAttendance() {
    return this.attendanceService.getAllAttendance();
  }
}

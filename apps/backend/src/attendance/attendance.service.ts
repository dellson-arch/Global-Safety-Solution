import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(userId: string, location?: string) {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dateObj = new Date(dateStr);

    const existing = await this.prisma.attendance.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: dateObj,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already checked in for today');
    }

    return this.prisma.attendance.create({
      data: {
        user_id: userId,
        date: dateObj,
        check_in: new Date(),
        location_in: location,
        status: 'PRESENT',
      },
    });
  }

  async checkOut(userId: string, location?: string) {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dateObj = new Date(dateStr);

    const existing = await this.prisma.attendance.findUnique({
      where: {
        user_id_date: {
          user_id: userId,
          date: dateObj,
        },
      },
    });

    if (!existing) {
      throw new BadRequestException('No check-in record found for today');
    }

    if (existing.check_out) {
      throw new BadRequestException('Already checked out for today');
    }

    return this.prisma.attendance.update({
      where: { id: existing.id },
      data: {
        check_out: new Date(),
        location_out: location,
      },
    });
  }

  async getAttendance(userId: string) {
    return this.prisma.attendance.findMany({
      where: { user_id: userId },
      orderBy: { date: 'desc' },
    });
  }

  async getAllAttendance() {
    return this.prisma.attendance.findMany({
      include: { user: true },
      orderBy: { date: 'desc' },
    });
  }
}

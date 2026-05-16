import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.compliance.findMany({
      include: { client: true, logs: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.compliance.findUnique({
      where: { id },
      include: { client: true, logs: true },
    });
  }

  async create(data: any) {
    return this.prisma.compliance.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.compliance.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.compliance.delete({ where: { id } });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiringCompliances() {
    this.logger.log('Running daily compliance expiry check...');

    const compliances = await this.prisma.compliance.findMany({
      where: { status: 'ACTIVE', expiry_date: { not: null } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const intervals = [90, 60, 30, 7];

    for (const comp of compliances) {
      if (!comp.expiry_date) continue;

      const expiry = new Date(comp.expiry_date);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (intervals.includes(diffDays)) {
        const existing = await this.prisma.reminder.findFirst({
          where: {
            reference_type: 'COMPLIANCE',
            reference_id: comp.id,
            reminder_for_days: diffDays,
          },
        });

        if (!existing) {
          await this.prisma.reminder.create({
            data: {
              reference_type: 'COMPLIANCE',
              reference_id: comp.id,
              reminder_date: today,
              reminder_for_days: diffDays,
              status: 'PENDING',
            },
          });
          this.logger.log(
            `Generated ${diffDays}-day reminder for compliance ${comp.id}`,
          );
        }
      }
    }
  }
}

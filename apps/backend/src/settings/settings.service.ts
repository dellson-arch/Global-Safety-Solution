import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const settings = await this.prisma.systemSetting.findMany();
    // Return as a key-value object for easier frontend consumption
    return settings.reduce(
      (acc: any, s: any) => ({ ...acc, [s.key]: s.value }),
      {},
    );
  }

  async update(key: string, value: string, category: string = 'GENERAL') {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, category },
      create: { key, value, category },
    });
  }

  async updateBatch(settings: Record<string, string>) {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.update(key, value),
    );
    return Promise.all(promises);
  }
}

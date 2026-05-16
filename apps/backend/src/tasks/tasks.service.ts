import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.task.findMany({
      include: {
        project: true,
        assignee: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { project_id: projectId },
      include: {
        assignee: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.task.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}

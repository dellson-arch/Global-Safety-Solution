const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ select: { email: true, name: true } });
  console.log('Users:', users);
  const roles = await prisma.role.findMany();
  console.log('Roles:', roles);
}

check().catch(console.error).finally(() => prisma.$disconnect());

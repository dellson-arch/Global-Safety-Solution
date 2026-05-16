const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const userRoles = await prisma.userRole.findMany({
    include: {
      user: { select: { email: true } },
      role: { select: { name: true } }
    }
  });
  console.log('User Roles:', JSON.stringify(userRoles, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promote() {
  const email = 'amrvbloggers@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  const role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  
  if (user && role) {
    await prisma.userRole.upsert({
      where: { user_id_role_id: { user_id: user.id, role_id: role.id } },
      update: {},
      create: { user_id: user.id, role_id: role.id },
    });
    console.log(`Promoted ${email} to SUPER_ADMIN`);
  } else {
    console.log('User or role not found');
  }
}

promote().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@repo/database');
require('dotenv').config();

async function test() {
  console.log('Testing with URL:', process.env.DATABASE_URL);
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('Connection successful!');
    const leads = await prisma.lead.findMany();
    console.log('Leads found:', leads.length);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();

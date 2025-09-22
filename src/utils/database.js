const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

process.on('beforeExit', async () => {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
});

module.exports = prisma;
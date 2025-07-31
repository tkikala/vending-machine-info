import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient();
  }
  prisma = globalThis.__prisma;
}

// Test the connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma client connected successfully');
  })
  .catch((error) => {
    console.error('❌ Prisma client connection failed:', error);
  });

export default prisma; 
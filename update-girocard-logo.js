import { PrismaClient } from './api/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

async function updateGirocardLogo() {
  try {
    const girocardLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iOCIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzRBOTBFMiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBvbHlnb24gcG9pbnRzPSIyNSwzNSA3NSwzNSA3MCw1NSAzMCw1NSIgZmlsbD0iIzFFM0E4QSIvPjxyZWN0IHg9IjMyIiB5PSIzOCIgd2lkdGg9IjYiIGhlaWdodD0iNiIgcng9IjEiIGZpbGw9IiMxRTNBOEEiLz48cmVjdCB4PSI0MCIgeT0iMzgiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHJ4PSIxIiBmaWxsPSIjMUUzQThBIi8+PHJlY3QgeD0iNDgiIHk9IjM4IiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiByeD0iMSIgZmlsbD0iIzFFM0E4QSIvPjxyZWN0IHg9IjMyIiB5PSI0NiIgd2lkdGg9IjYiIGhlaWdodD0iNiIgcng9IjEiIGZpbGw9IiMxRTNBOEEiLz48cmVjdCB4PSI0MCIgeT0iNDYiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHJ4PSIxIiBmaWxsPSIjMUUzQThBIi8+PHJlY3QgeD0iNDgiIHk9IjQ2IiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiByeD0iMSIgZmlsbD0iIzFFM0E4QSIvPjxyZWN0IHg9IjMyIiB5PSI1NCIgd2lkdGg9IjYiIGhlaWdodD0iNiIgcng9IjEiIGZpbGw9IiMxRTNBOEEiLz48cmVjdCB4PSI0MCIgeT0iNTQiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHJ4PSIxIiBmaWxsPSIjMUUzQThBIi8+PHJlY3QgeD0iNDgiIHk9IjU0IiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiByeD0iMSIgZmlsbD0iIzFFM0E4QSIvPjxyZWN0IHg9IjM1IiB5PSIyNSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjgiIHJ4PSIyIiBmaWxsPSIjNEE5MEUyIi8+PHBvbHlnb24gcG9pbnRzPSI0OCwzMyA1MCwzMyA0OSwzNyIgZmlsbD0iIzRBOTBFMiIvPjx0ZXh0IHg9IjUwIiB5PSI3NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0ibm9ybWFsIiBmaWxsPSIjMUUzQThBIj5naXJvY2FyZDwvdGV4dD48L3N2Zz4K';

    const updatedPaymentMethod = await prisma.paymentMethodType.update({
      where: {
        type: 'GIROCARD'
      },
      data: {
        icon: girocardLogo
      }
    });

    console.log('✅ GIROCARD logo updated successfully:', updatedPaymentMethod);
  } catch (error) {
    console.error('❌ Error updating GIROCARD logo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateGirocardLogo(); 
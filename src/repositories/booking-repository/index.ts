import { prisma } from '@/config';

async function insertBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function getBookings(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function getBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
}
async function updateBooking(roomId: number, bookingId: number, userId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      userId,
      roomId,
    },
  });
}

const bookingRepository = {
  insertBooking,
  getBookings,
  getBookingByUserId,
  updateBooking,
};

export default bookingRepository;

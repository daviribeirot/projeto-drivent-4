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
    include: {
      Room: true,
    },
  });
}

async function getUserBooking(userId: number, bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
      id: bookingId,
    },
  });
}

async function updateBooking(roomId: number, bookingId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}

const bookingRepository = {
  insertBooking,
  getBookings,
  getUserBooking,
  updateBooking,
};

export default bookingRepository;

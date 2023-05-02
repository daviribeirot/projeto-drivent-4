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

async function getBookingByUser(userId: number, bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
      id: bookingId,
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
  getBookingByUser,
  updateBooking,
};

export default bookingRepository;

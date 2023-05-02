import { notFoundError, forbiddenError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelRepository from '@/repositories/hotel-repository';

async function verifyTicketAndEnrollment(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();

  if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }
}

async function getBookings(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  const booking = await bookingRepository.getBookings(userId);

  if (!booking || !enrollment) throw notFoundError();

  return booking;
}

async function insertBooking(userId: number, roomId: number) {
  await verifyTicketAndEnrollment(userId);

  const room = await hotelRepository.getRoomAndBookingById(roomId);

  if (!room) throw notFoundError();

  if (room.capacity <= room.Booking.length) throw forbiddenError();

  const booking = await bookingRepository.insertBooking(userId, roomId);

  return booking;
}

async function updateBooking(bookingId: number, userId: number, roomId: number) {
  await verifyTicketAndEnrollment(userId);

  const room = await hotelRepository.getRoomAndBookingById(roomId);

  console.log({ room });

  if (!room) throw notFoundError();

  if (room.capacity <= room.Booking.length) throw forbiddenError();

  const updatedBooking = await bookingRepository.updateBooking(bookingId, roomId, userId);

  console.log({ updatedBooking });

  return updatedBooking;
}

const bookingService = { getBookings, insertBooking, updateBooking };

export default bookingService;

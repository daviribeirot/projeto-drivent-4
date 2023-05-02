import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = bookingService.getBookings(userId);

    if (!booking) return res.sendStatus(httpStatus.NOT_FOUND);

    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === 'ForbiddenError') return res.sendStatus(httpStatus.FORBIDDEN);

    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function insertBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    if (!roomId) return res.sendStatus(httpStatus.BAD_REQUEST);

    const booking = await bookingService.insertBooking(userId, roomId);

    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === 'ForbiddenError') return res.sendStatus(httpStatus.FORBIDDEN);

    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } = req.params;

  try {
    if (!roomId || !bookingId) return res.sendStatus(httpStatus.BAD_REQUEST);

    const updatedBooking = await bookingService.updateBooking(userId, roomId, Number(bookingId));

    return res.status(httpStatus.OK).send({ bookingId: updatedBooking.id });
  } catch (error) {
    if (error.name === 'ForbiddenError') return res.sendStatus(httpStatus.FORBIDDEN);

    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

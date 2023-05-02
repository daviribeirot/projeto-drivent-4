import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const booking = bookingService.getBookings(userId);

    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    next(error);
  }
}

export async function insertBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    if (!roomId) return res.sendStatus(httpStatus.FORBIDDEN);

    const booking = await bookingService.insertBooking(userId, roomId);

    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    next(error);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } = req.params;

  try {
    if (!roomId || !bookingId) return res.sendStatus(httpStatus.FORBIDDEN);

    const updatedBooking = await bookingService.updateBooking(userId, roomId, Number(bookingId));

    return res.status(httpStatus.OK).send({ bookingId: updatedBooking.id });
  } catch (error) {
    next(error);
  }
}

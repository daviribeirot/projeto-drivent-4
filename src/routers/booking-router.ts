import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getBooking, insertBooking, updateBooking } from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .post('/', insertBooking)
  .put('/:bookingId', updateBooking);

export { bookingRouter };

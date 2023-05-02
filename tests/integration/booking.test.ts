import httpStatus from 'http-status';
import supertest from 'supertest';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createBooking,
  createEnrollmentWithAddress,
  createHotel,
  createPayment,
  createTicketTypeRemote,
  createRoomWithHotelId,
  createMaxCapacityRoom,
  createTicket,
  createTicketType,
  createUser,
  createTicketTypeWithHotel,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const result = await server.get('/booking');
    expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const result = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for a given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const result = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  describe('GET /booking with valid token', () => {
    it('should respond with status 404 if there is no booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const result = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(result.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 if there are bookings', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const result = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(result.status).toEqual(httpStatus.OK);
      expect(result.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

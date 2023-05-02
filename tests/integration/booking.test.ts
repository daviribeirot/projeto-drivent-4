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

describe('GET: /booking', () => {
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

  describe('GET: /booking with valid token', () => {
    it('should respond with status 404 if there is no booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const result = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(result.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 if there are bookings', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
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

  describe('POST: /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
      const result = await server.post('/booking/');
      expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it('should respond with 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
      const result = await server.post('/booking/').set('Authorization', `Bearer ${token}`);
      expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for a given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      const result = await server.post('/booking/').set('Authorization', `Bearer ${token}`);
      expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    describe('POST: /bookings when token is valid', () => {
      it('should respond with status 200 and booking id', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
        const payment = await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const result = await server.post('/booking/').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
        expect(result.status).toBe(httpStatus.OK);
        expect(result.body).toEqual({
          bookingId: expect.any(Number),
        });
      });
      it('should respond with status 404 if room is not found', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const result = await server.post('/booking/').set('Authorization', `Bearer ${token}`);
        expect(result.status).toEqual(httpStatus.NOT_FOUND);
      });

      it('should respond with status 403 if ticket is not PAID', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const ticketType = await createTicketType();
        const ticket = await createTicket(enrollment.id, ticketType.id, 'RESERVED');
        const result = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
        expect(result.status).toEqual(httpStatus.FORBIDDEN);
      });
      it('should respond with status 403 if ticket is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
        const result = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
        expect(result.status).toEqual(httpStatus.FORBIDDEN);
      });
      it('should respond with status 403 if ticket does not include hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
        const result = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
        expect(result.status).toEqual(httpStatus.FORBIDDEN);
      });

      it('should respond with status 403 if room is at full capacity', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
        const payment = await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
        const room = await createMaxCapacityRoom(hotel.id);
        const booking = await createBooking(user.id, room.id);
        const result = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
        expect(result.status).toEqual(httpStatus.FORBIDDEN);
      });
    });

    describe('PUT: /bookings:bookingId', () => {
      it('should respond with status 401 if no token is given', async () => {
        const result = await server.put('/booking/');
        expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
      });

      it('should respond with 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
        const result = await server.put('/booking/').set('Authorization', `Bearer ${token}`);
        expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
      });

      it('should respond with status 401 if there is no session for a given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
        const result = await server.put('/booking/').set('Authorization', `Bearer ${token}`);
        expect(result.status).toEqual(httpStatus.UNAUTHORIZED);
      });

      describe('PUT: /bookings:bookingId when token is valid', () => {
        it('should respond with status 200 and booking id', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
          const secondRoom = await createRoomWithHotelId(hotel.id);
          const booking = await createBooking(user.id, room.id);
          const result = await server
            .put(`/booking/${booking.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: secondRoom.id });
          expect(result.status).toEqual(httpStatus.OK);
          expect(result.body).toEqual({
            bookingId: booking.id,
          });
        });
        it('should respond with status 404 if no room is found', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const result = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
          expect(result.status).toEqual(httpStatus.NOT_FOUND);
        });
        it('should respond with status 403 if room is capacity is full', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const enrollment = await createEnrollmentWithAddress(user);
          const ticketType = await createTicketTypeWithHotel();
          await createTicket(enrollment.id, ticketType.id, 'PAID');
          const hotel = await createHotel();
          const room = await createMaxCapacityRoom(hotel.id);
          await createBooking(user.id, room.id);
          const result = await server
            .put('/booking/1')
            .send({ roomId: room.id })
            .set('Authorization', `Bearer ${token}`);

          expect(result.status).toBe(httpStatus.FORBIDDEN);
        });
        it('should respond with status 403 if user has no bookings', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
          const hotel = await createHotel();
          const room = await createRoomWithHotelId(hotel.id);
          console.log(room, hotel);
          const result = await server
            .put('/booking/1')
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: room.id });
          expect(result.status).toEqual(httpStatus.FORBIDDEN);
        });
      });
    });
  });
});

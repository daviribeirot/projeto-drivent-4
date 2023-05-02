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

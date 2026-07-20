import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { TicketsService } from './tickets.service';

describe('PATCH /api/tickets/:id/status validation (T-004 B-2)', () => {
  let app: INestApplication<App>;
  let tickets: TicketsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    tickets = app.get(TicketsService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects a status outside the allowed union with 400, leaving the ticket unchanged', async () => {
    const ticket = tickets.create({ title: 'Untouched ticket' });

    const res = await request(app.getHttpServer())
      .patch(`/api/tickets/${ticket.id}/status`)
      .send({ status: 'archived' });

    expect(res.status).toBe(400);

    const list = await request(app.getHttpServer()).get('/api/tickets');
    const persisted = list.body.find((t: { id: string }) => t.id === ticket.id);
    expect(persisted.status).toBe('todo');
  });

  it('returns 404 for an unknown ticket id', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/tickets/no-such-ticket/status')
      .send({ status: 'done' });

    expect(res.status).toBe(404);
  });
});

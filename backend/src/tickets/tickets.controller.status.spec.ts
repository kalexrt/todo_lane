import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { TicketsService } from './tickets.service';

describe('PATCH /api/tickets/:id/status (T-004 B-1)', () => {
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

  it('moves a ticket through every status, in any direction, persisting each move', async () => {
    const ticket = tickets.create({ title: 'Movable ticket' });
    expect(ticket.status).toBe('todo');

    const moves: Array<'todo' | 'in_progress' | 'done'> = [
      'in_progress',
      'done',
      'todo',
    ];

    for (const status of moves) {
      const res = await request(app.getHttpServer())
        .patch(`/api/tickets/${ticket.id}/status`)
        .send({ status });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(ticket.id);
      expect(res.body.status).toBe(status);

      const list = await request(app.getHttpServer()).get('/api/tickets');
      const persisted = list.body.find((t: { id: string }) => t.id === ticket.id);
      expect(persisted.status).toBe(status);
    }
  });
});

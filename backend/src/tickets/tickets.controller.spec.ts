import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { TicketsService } from './tickets.service';

describe('GET /api/tickets (T-002 B-1)', () => {
  let app: INestApplication<App>;
  let tickets: TicketsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    tickets = app.get(TicketsService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 with an empty JSON array at boot', async () => {
    const res = await request(app.getHttpServer()).get('/api/tickets');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns each ticket with exactly id, projectId, title, description, status', async () => {
    tickets.create({ title: 'First ticket', description: 'the tracer bullet' });

    const res = await request(app.getHttpServer()).get('/api/tickets');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    const ticket = res.body[0];
    expect(Object.keys(ticket).sort()).toEqual([
      'description',
      'id',
      'projectId',
      'status',
      'title',
    ]);
    expect(typeof ticket.id).toBe('string');
    expect(typeof ticket.projectId).toBe('string');
    expect(ticket.title).toBe('First ticket');
    expect(ticket.description).toBe('the tracer bullet');
    expect(ticket.status).toBe('todo');
  });

  it('filters by ?projectId=', async () => {
    tickets.create({ title: 'in default project', description: '' });
    tickets.create({
      title: 'in another project',
      description: '',
      projectId: 'other-project',
    });

    const res = await request(app.getHttpServer())
      .get('/api/tickets')
      .query({ projectId: 'other-project' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('in another project');
    expect(res.body[0].projectId).toBe('other-project');
  });
});

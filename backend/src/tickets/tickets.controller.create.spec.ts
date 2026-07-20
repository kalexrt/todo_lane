import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { DEFAULT_PROJECT_ID } from './tickets.service';

describe('POST /api/tickets (T-003 B-1)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a ticket and returns 201 with server-assigned fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tickets')
      .send({ title: 'First ticket', description: 'the tracer bullet' });

    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe('string');
    expect(res.body.status).toBe('todo');
    expect(res.body.projectId).toBe(DEFAULT_PROJECT_ID);
    expect(res.body.title).toBe('First ticket');
    expect(res.body.description).toBe('the tracer bullet');
  });

  it('the created ticket appears in a subsequent GET /api/tickets', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/tickets')
      .send({ title: 'Findable ticket' });

    const res = await request(app.getHttpServer()).get('/api/tickets');

    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(created.body.id);
    expect(res.body[0].title).toBe('Findable ticket');
  });
});

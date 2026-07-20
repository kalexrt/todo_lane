import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

describe('POST /api/tickets with an explicit, existing projectId (T-003 B-1 coverage)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates the ticket under the given project when it exists', async () => {
    const project = await request(app.getHttpServer())
      .post('/api/projects')
      .send({ name: 'Mobile', key: 'MOB' });

    const res = await request(app.getHttpServer())
      .post('/api/tickets')
      .send({ title: 'Ticket in Mobile', projectId: project.body.id });

    expect(res.status).toBe(201);
    expect(res.body.projectId).toBe(project.body.id);

    const list = await request(app.getHttpServer())
      .get('/api/tickets')
      .query({ projectId: project.body.id });

    expect(list.body).toHaveLength(1);
    expect(list.body[0].id).toBe(res.body.id);
  });
});

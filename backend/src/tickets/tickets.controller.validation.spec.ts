import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

describe('POST /api/tickets validation (T-003 B-2)', () => {
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

  it('rejects a missing title with 400 and creates nothing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tickets')
      .send({ description: 'no title here' });

    expect(res.status).toBe(400);

    const list = await request(app.getHttpServer()).get('/api/tickets');
    expect(list.body).toEqual([]);
  });

  it('rejects an empty-string title with 400 and creates nothing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tickets')
      .send({ title: '' });

    expect(res.status).toBe(400);

    const list = await request(app.getHttpServer()).get('/api/tickets');
    expect(list.body).toEqual([]);
  });

  it('rejects a whitespace-only title with 400 and creates nothing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tickets')
      .send({ title: '   ' });

    expect(res.status).toBe(400);

    const list = await request(app.getHttpServer()).get('/api/tickets');
    expect(list.body).toEqual([]);
  });

  it('rejects an unknown projectId with 400 and creates nothing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/tickets')
      .send({ title: 'Valid title', projectId: 'no-such-project' });

    expect(res.status).toBe(400);

    const list = await request(app.getHttpServer()).get('/api/tickets');
    expect(list.body).toEqual([]);
  });
});

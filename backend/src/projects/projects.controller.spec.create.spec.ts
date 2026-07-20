import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

describe('POST /api/projects (T-003 B-3)', () => {
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

  it('creates a project and returns 201 with the echoed fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/projects')
      .send({ name: 'Mobile', key: 'MOB' });

    expect(res.status).toBe(201);
    expect(typeof res.body.id).toBe('string');
    expect(res.body.name).toBe('Mobile');
    expect(res.body.key).toBe('MOB');
  });

  it('the created project appears in a subsequent GET /api/projects', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/projects')
      .send({ name: 'Mobile', key: 'MOB' });

    const res = await request(app.getHttpServer()).get('/api/projects');

    expect(res.body).toHaveLength(2);
    expect(res.body.map((p: { id: string }) => p.id)).toContain(created.body.id);
  });

  it('rejects a missing name with 400 and creates nothing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/projects')
      .send({ key: 'MOB' });

    expect(res.status).toBe(400);

    const list = await request(app.getHttpServer()).get('/api/projects');
    expect(list.body).toHaveLength(1);
  });

  it('rejects a missing key with 400 and creates nothing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/projects')
      .send({ name: 'Mobile' });

    expect(res.status).toBe(400);

    const list = await request(app.getHttpServer()).get('/api/projects');
    expect(list.body).toHaveLength(1);
  });
});

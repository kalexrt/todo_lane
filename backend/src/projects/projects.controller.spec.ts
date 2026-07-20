import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { TicketsService } from '../tickets/tickets.service';

describe('GET /api/projects (T-002 B-2)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 with the seeded default project at boot, with no setup call', async () => {
    const res = await request(app.getHttpServer()).get('/api/projects');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    const project = res.body[0];
    expect(Object.keys(project).sort()).toEqual(['id', 'key', 'name']);
    expect(typeof project.id).toBe('string');
    expect(typeof project.name).toBe('string');
    expect(typeof project.key).toBe('string');
  });

  it("default project's id is the projectId tickets receive when created without one", async () => {
    const tickets = app.get(TicketsService);
    const ticket = tickets.create({ title: 'homeless ticket' });

    const res = await request(app.getHttpServer()).get('/api/projects');

    expect(res.body[0].id).toBe(ticket.projectId);
  });
});

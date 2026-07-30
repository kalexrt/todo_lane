import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

/**
 * B-3 — a status change made through the single status-change endpoint survives
 * into a new application instance, and leaves other tickets alone.
 *
 * Guards the specific bug where the status-change method mutates the row object
 * it read instead of writing through to the database.
 */
describe('status-change persistence across application instances (T-sqlite-persistence-tp1eij B-3)', () => {
  let tempDir: string;
  let previousDbPath: string | undefined;

  async function createInstance(): Promise<INestApplication<App>> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication<INestApplication<App>>();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    return app;
  }

  beforeAll(() => {
    previousDbPath = process.env.TRACKER_DB_PATH;
    tempDir = mkdtempSync(join(tmpdir(), 'tracker-b3-'));
    process.env.TRACKER_DB_PATH = join(tempDir, 'tracker.db');
  });

  afterAll(() => {
    if (previousDbPath === undefined) {
      delete process.env.TRACKER_DB_PATH;
    } else {
      process.env.TRACKER_DB_PATH = previousDbPath;
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('reports a moved ticket as in_progress from a new instance, leaving other tickets untouched', async () => {
    const instanceA = await createInstance();

    const moved = await request(instanceA.getHttpServer())
      .post('/api/tickets')
      .send({ title: 'Gets moved' });
    const untouched = await request(instanceA.getHttpServer())
      .post('/api/tickets')
      .send({ title: 'Stays put' });

    expect(moved.status).toBe(201);
    expect(untouched.status).toBe(201);

    const patched = await request(instanceA.getHttpServer())
      .patch(`/api/tickets/${moved.body.id}/status`)
      .send({ status: 'in_progress' });
    expect(patched.status).toBe(200);
    expect(patched.body.status).toBe('in_progress');

    await instanceA.close();

    // A separate application instance, same database file — the "restart".
    const instanceB = await createInstance();
    try {
      const listed = await request(instanceB.getHttpServer()).get('/api/tickets');
      expect(listed.status).toBe(200);

      const tickets = listed.body as Array<{
        id: string;
        title: string;
        status: string;
      }>;

      expect(
        tickets.find((ticket) => ticket.id === moved.body.id),
      ).toMatchObject({ title: 'Gets moved', status: 'in_progress' });
      expect(
        tickets.find((ticket) => ticket.id === untouched.body.id),
      ).toMatchObject({ title: 'Stays put', status: 'todo' });
    } finally {
      await instanceB.close();
    }
  });
});

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

/**
 * AC-3 guard (regression, off-ledger) — a rejected request must persist nothing.
 *
 * Holds by construction today: DTO/ValidationPipe rejection happens before the
 * service is entered, and createValidated's unknown-projectId check and
 * updateStatus's unknown-id 404 both precede any write statement. Locked here so
 * a future change that writes before validating is caught.
 *
 * Each assertion reads back from a NEWLY OPENED instance, so a stale in-memory
 * view cannot make the test pass.
 */
describe('rejected requests persist nothing (T-sqlite-persistence-tp1eij AC-3 guard)', () => {
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
    tempDir = mkdtempSync(join(tmpdir(), 'tracker-ac3-'));
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

  it('persists no ticket, no project and no status change from any rejected request', async () => {
    const instanceA = await createInstance();

    // A legitimate ticket, so the invalid-status case has a real target.
    const seeded = await request(instanceA.getHttpServer())
      .post('/api/tickets')
      .send({ title: 'Untouched by rejections' });
    expect(seeded.status).toBe(201);

    // 400 — missing title.
    expect(
      (await request(instanceA.getHttpServer()).post('/api/tickets').send({}))
        .status,
    ).toBe(400);

    // 400 — whitespace-only title.
    expect(
      (
        await request(instanceA.getHttpServer())
          .post('/api/tickets')
          .send({ title: '   ' })
      ).status,
    ).toBe(400);

    // 400 — unknown projectId.
    expect(
      (
        await request(instanceA.getHttpServer())
          .post('/api/tickets')
          .send({ title: 'Orphan', projectId: 'no-such-project' })
      ).status,
    ).toBe(400);

    // 400 — project missing key.
    expect(
      (
        await request(instanceA.getHttpServer())
          .post('/api/projects')
          .send({ name: 'Keyless' })
      ).status,
    ).toBe(400);

    // 400 — status outside the union.
    expect(
      (
        await request(instanceA.getHttpServer())
          .patch(`/api/tickets/${seeded.body.id}/status`)
          .send({ status: 'In Progress' })
      ).status,
    ).toBe(400);

    // 404 — unknown ticket id.
    expect(
      (
        await request(instanceA.getHttpServer())
          .patch('/api/tickets/no-such-ticket/status')
          .send({ status: 'done' })
      ).status,
    ).toBe(404);

    await instanceA.close();

    const instanceB = await createInstance();
    try {
      const tickets = (await request(instanceB.getHttpServer()).get('/api/tickets'))
        .body as Array<{ id: string; status: string }>;
      const projects = (
        await request(instanceB.getHttpServer()).get('/api/projects')
      ).body as Array<{ id: string }>;

      // Only the seeded ticket, still todo — no partial or orphan rows.
      expect(tickets).toHaveLength(1);
      expect(tickets[0].id).toBe(seeded.body.id);
      expect(tickets[0].status).toBe('todo');

      // Only the default project — the keyless one was never written.
      expect(projects).toHaveLength(1);
    } finally {
      await instanceB.close();
    }
  });
});

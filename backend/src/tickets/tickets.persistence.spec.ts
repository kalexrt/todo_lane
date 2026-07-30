import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';

/**
 * B-1 (tracer bullet) — a ticket created over the API is still there for a NEW
 * application instance opened against the same database file.
 *
 * The real filesystem boundary is exercised, never faked: isolation comes from
 * pointing TRACKER_DB_PATH at a unique empty temp directory, not from replacing
 * the store.
 */
describe('ticket persistence across application instances (T-sqlite-persistence-tp1eij B-1)', () => {
  let tempDir: string;
  let dbPath: string;
  let previousDbPath: string | undefined;

  /** Builds a fresh application instance wired exactly as main.ts does. */
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
    tempDir = mkdtempSync(join(tmpdir(), 'tracker-b1-'));
    // A path inside an empty directory — no database file exists here yet.
    dbPath = join(tempDir, 'tracker.db');
    process.env.TRACKER_DB_PATH = dbPath;
  });

  afterAll(() => {
    if (previousDbPath === undefined) {
      delete process.env.TRACKER_DB_PATH;
    } else {
      process.env.TRACKER_DB_PATH = previousDbPath;
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns a ticket created by a previous instance from the same database file', async () => {
    const instanceA = await createInstance();

    const created = await request(instanceA.getHttpServer())
      .post('/api/tickets')
      .send({ title: 'Survives a restart', description: 'written by instance A' });

    expect(created.status).toBe(201);
    expect(created.body.id).toBeTruthy();
    expect(created.body.status).toBe('todo');

    const written = created.body;
    await instanceA.close();

    // A separate application instance, same database file — the "restart".
    const instanceB = await createInstance();
    try {
      const listed = await request(instanceB.getHttpServer()).get('/api/tickets');

      expect(listed.status).toBe(200);
      const found = (listed.body as Array<{ id: string }>).find(
        (ticket) => ticket.id === written.id,
      );

      expect(found).toEqual({
        id: written.id,
        projectId: written.projectId,
        title: 'Survives a restart',
        description: 'written by instance A',
        status: 'todo',
      });
    } finally {
      await instanceB.close();
    }
  });
});

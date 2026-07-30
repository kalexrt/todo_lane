import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { DEFAULT_PROJECT_ID } from './project.entity';

/**
 * AC-4 guard (regression, off-ledger) — the default project is ENSURED, not
 * inserted: any number of boots against one database leaves exactly one, and a
 * project the user created is never disturbed.
 *
 * Holds by construction from B-1's bootstrap (CREATE TABLE IF NOT EXISTS +
 * insert-if-absent). Locked here so a future switch to a plain INSERT (crash or
 * duplicate) or INSERT OR REPLACE (silently resets user data) is caught.
 */
describe('default project is ensured exactly once across boots (T-sqlite-persistence-tp1eij AC-4 guard)', () => {
  let tempDir: string;
  let dbPath: string;
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
    tempDir = mkdtempSync(join(tmpdir(), 'tracker-ac4-'));
    dbPath = join(tempDir, 'nested', 'tracker.db');
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

  it('creates a missing database and keeps exactly one default project across three boots', async () => {
    // A fresh checkout: neither the file nor its parent directory exists yet.
    expect(existsSync(dbPath)).toBe(false);

    const first = await createInstance();
    expect(existsSync(dbPath)).toBe(true);

    const userProject = await request(first.getHttpServer())
      .post('/api/projects')
      .send({ name: 'User Project', key: 'USR' });
    expect(userProject.status).toBe(201);
    await first.close();

    // Two further boots against the same database.
    const second = await createInstance();
    await second.close();

    const third = await createInstance();
    try {
      const projects = (await request(third.getHttpServer()).get('/api/projects'))
        .body as Array<{ id: string; name: string; key: string }>;

      expect(
        projects.filter((project) => project.id === DEFAULT_PROJECT_ID),
      ).toHaveLength(1);

      // The user's project survived every re-boot, unmodified.
      expect(projects).toContainEqual({
        id: userProject.body.id,
        name: 'User Project',
        key: 'USR',
      });
      expect(projects).toHaveLength(2);
    } finally {
      await third.close();
    }
  });
});

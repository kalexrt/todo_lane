import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { DEFAULT_PROJECT_ID } from './project.entity';

/**
 * B-2 — a project created over the API is still there for a NEW application
 * instance opened against the same database file, and the default project is
 * not duplicated by the second boot.
 */
describe('project persistence across application instances (T-sqlite-persistence-tp1eij B-2)', () => {
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
    tempDir = mkdtempSync(join(tmpdir(), 'tracker-b2-'));
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

  it('returns a project created by a previous instance, without duplicating the default project', async () => {
    const instanceA = await createInstance();

    const created = await request(instanceA.getHttpServer())
      .post('/api/projects')
      .send({ name: 'Persisted Project', key: 'PER' });

    expect(created.status).toBe(201);
    expect(created.body.id).toBeTruthy();

    const written = created.body;
    await instanceA.close();

    // A separate application instance, same database file — the "restart".
    const instanceB = await createInstance();
    try {
      const listed = await request(instanceB.getHttpServer()).get('/api/projects');
      expect(listed.status).toBe(200);

      const projects = listed.body as Array<{
        id: string;
        name: string;
        key: string;
      }>;

      expect(projects).toContainEqual({
        id: written.id,
        name: 'Persisted Project',
        key: 'PER',
      });

      // The second boot must not re-seed a default project alongside the first.
      const defaults = projects.filter(
        (project) => project.id === DEFAULT_PROJECT_ID,
      );
      expect(defaults).toHaveLength(1);
      expect(projects).toHaveLength(2);
    } finally {
      await instanceB.close();
    }
  });
});

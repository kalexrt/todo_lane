import { mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, sep } from 'node:path';
import {
  EPHEMERAL_DATABASE,
  openDatabase,
  resolveDatabasePath,
} from './database';

/**
 * Unit cover for the schema/bootstrap logic and for where the database lives.
 * Both are asked for by name in the TSD's Tests row; the endpoint specs only
 * reach them transitively, and the default-path branch is unreachable from any
 * spec that inherits the ephemeral default.
 */
describe('database bootstrap (T-sqlite-persistence-tp1eij)', () => {
  describe('resolveDatabasePath', () => {
    const configured = process.env.TRACKER_DB_PATH;

    afterEach(() => {
      if (configured === undefined) {
        delete process.env.TRACKER_DB_PATH;
      } else {
        process.env.TRACKER_DB_PATH = configured;
      }
    });

    it('uses the configured location when the environment variable is set', () => {
      process.env.TRACKER_DB_PATH = '/somewhere/else/tracker.db';
      expect(resolveDatabasePath()).toBe('/somewhere/else/tracker.db');
    });

    it('accepts an ephemeral location', () => {
      process.env.TRACKER_DB_PATH = EPHEMERAL_DATABASE;
      expect(resolveDatabasePath()).toBe(EPHEMERAL_DATABASE);
    });

    it('ignores a blank setting and falls back to the default', () => {
      process.env.TRACKER_DB_PATH = '   ';
      expect(resolveDatabasePath()).toBe(defaultPath());
    });

    // The branch that decides where real user data lands — no other spec reaches it.
    it('defaults to a file inside the backend package when unset', () => {
      delete process.env.TRACKER_DB_PATH;

      const resolved = resolveDatabasePath();
      expect(isAbsolute(resolved)).toBe(true);
      expect(resolved).toBe(defaultPath());
      // Inside the backend package, not the process working directory.
      expect(resolved.endsWith(join('backend', 'data', 'tracker.db'))).toBe(true);
    });

    /** Independently derived from this spec's own location, not from the code. */
    function defaultPath(): string {
      const backendRoot = __dirname.split(`${sep}src${sep}`)[0];
      return join(backendRoot, 'data', 'tracker.db');
    }
  });

  describe('openDatabase', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'tracker-bootstrap-'));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('creates the file, any missing parent directory, and both tables', () => {
      const path = join(tempDir, 'deeply', 'nested', 'tracker.db');
      expect(existsSync(path)).toBe(false);

      const db = openDatabase(path);
      try {
        expect(existsSync(path)).toBe(true);

        const tables = db
          .prepare(
            "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
          )
          .all() as Array<{ name: string }>;
        expect(tables.map((table) => table.name)).toEqual([
          'projects',
          'tickets',
        ]);
      } finally {
        db.close();
      }
    });

    it('is safe to re-run against an existing database — no drop, no duplicate', () => {
      const path = join(tempDir, 'tracker.db');

      const first = openDatabase(path);
      first
        .prepare('INSERT INTO tickets VALUES (?, ?, ?, ?, ?)')
        .run('t-1', 'default', 'Existing', 'survives bootstrap', 'in_progress');
      first.close();

      // Bootstrapping again must leave the existing row exactly as it was.
      const second = openDatabase(path);
      try {
        expect(
          second.prepare('SELECT * FROM tickets ORDER BY rowid').all(),
        ).toEqual([
          {
            id: 't-1',
            projectId: 'default',
            title: 'Existing',
            description: 'survives bootstrap',
            status: 'in_progress',
          },
        ]);
      } finally {
        second.close();
      }
    });

    it('opens an ephemeral database without touching the filesystem', () => {
      const db = openDatabase(EPHEMERAL_DATABASE);
      try {
        expect(db.prepare('SELECT * FROM tickets').all()).toEqual([]);
        expect(existsSync(join(process.cwd(), EPHEMERAL_DATABASE))).toBe(false);
      } finally {
        db.close();
      }
    });
  });
});

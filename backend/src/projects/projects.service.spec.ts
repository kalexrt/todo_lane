import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  DatabaseConnection,
  EPHEMERAL_DATABASE,
  openDatabase,
} from '../database/database';
import { DEFAULT_PROJECT_ID } from './project.entity';
import { ProjectsService } from './projects.service';

/** The real driver against a real (ephemeral or temp-file) database — never a fake. */
function connect(path: string = EPHEMERAL_DATABASE): DatabaseConnection {
  return { db: openDatabase(path) } as DatabaseConnection;
}

describe('ProjectsService persistence (T-sqlite-persistence-tp1eij)', () => {
  it('round-trips a created project through the database with identical fields', () => {
    const connection = connect();
    try {
      const service = new ProjectsService(connection);

      const created = service.create({ name: 'Round Trip', key: 'RTP' });
      expect(created.id).toBeTruthy();

      const readBack = service.findAll().find((p) => p.id === created.id);
      expect(readBack).toEqual({
        id: created.id,
        name: 'Round Trip',
        key: 'RTP',
      });
    } finally {
      connection.db.close();
    }
  });

  it('reports existence only for projects actually stored', () => {
    const connection = connect();
    try {
      const service = new ProjectsService(connection);
      const created = service.create({ name: 'Real', key: 'REA' });

      expect(service.exists(created.id)).toBe(true);
      expect(service.exists(DEFAULT_PROJECT_ID)).toBe(true);
      expect(service.exists('never-created')).toBe(false);
    } finally {
      connection.db.close();
    }
  });

  it('seeds the default project on a first bootstrap', () => {
    const connection = connect();
    try {
      expect(new ProjectsService(connection).findAll()).toEqual([
        { id: DEFAULT_PROJECT_ID, name: 'Default', key: 'DEF' },
      ]);
    } finally {
      connection.db.close();
    }
  });

  describe('ensuring the default project across repeated bootstraps', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'tracker-ensure-'));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('leaves exactly one default project, in place, after many bootstraps', () => {
      const path = join(tempDir, 'tracker.db');

      // First boot seeds the default, then a user adds a project.
      const first = connect(path);
      const userProject = new ProjectsService(first).create({
        name: 'User Project',
        key: 'USR',
      });
      first.db.close();

      // Several more boots against the same database.
      for (let boot = 0; boot < 3; boot += 1) {
        const connection = connect(path);
        new ProjectsService(connection);
        connection.db.close();
      }

      const final = connect(path);
      try {
        const projects = new ProjectsService(final).findAll();

        expect(
          projects.filter((p) => p.id === DEFAULT_PROJECT_ID),
        ).toHaveLength(1);
        expect(projects).toHaveLength(2);

        /*
         * Ordering is the tell that the default was IGNORED, not REPLACED:
         * INSERT OR REPLACE deletes the conflicting row and re-inserts it with a
         * fresh rowid, which would move the default AFTER the user's project (and
         * silently reset a renamed default). Asserting order therefore catches a
         * regression that a count-and-contains check cannot.
         */
        expect(projects.map((p) => p.id)).toEqual([
          DEFAULT_PROJECT_ID,
          userProject.id,
        ]);
      } finally {
        final.db.close();
      }
    });
  });
});

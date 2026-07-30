import { Injectable, OnModuleDestroy } from '@nestjs/common';
import SQLite, { Database } from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** Selects an ephemeral database — SQLite's own convention. Used by tests. */
export const EPHEMERAL_DATABASE = ':memory:';

/**
 * Where the database lives. Read fresh on every call (never cached at module
 * load) so a test can point TRACKER_DB_PATH somewhere isolated before building
 * an application instance.
 */
export function resolveDatabasePath(): string {
  const configured = process.env.TRACKER_DB_PATH?.trim();
  return configured ? configured : join(process.cwd(), 'data', 'tracker.db');
}

/**
 * Opens the database, creating the file, its parent directory and the schema
 * when absent, so a fresh checkout boots cleanly. Safe to run against an
 * existing database: it neither drops nor duplicates anything.
 */
export function openDatabase(path: string = resolveDatabasePath()): Database {
  if (path !== EPHEMERAL_DATABASE) {
    mkdirSync(dirname(path), { recursive: true });
  }

  const db = new SQLite(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id   TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key  TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tickets (
      id          TEXT PRIMARY KEY,
      projectId   TEXT NOT NULL,
      title       TEXT NOT NULL,
      description TEXT NOT NULL,
      status      TEXT NOT NULL
    );
  `);
  return db;
}

/**
 * Owns the connection handle — nothing more. Every statement that reads or
 * writes a domain row lives in ProjectsService / TicketsService (ADR-0002:
 * no repository layer beyond those services).
 */
@Injectable()
export class DatabaseConnection implements OnModuleDestroy {
  readonly db: Database = openDatabase();

  /** Releases the file so another instance can open it (app.close()). */
  onModuleDestroy(): void {
    this.db.close();
  }
}

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseConnection } from '../database/database';
import { DEFAULT_PROJECT_ID, Project } from './project.entity';

const COLUMNS = 'id, name, key';

@Injectable()
export class ProjectsService {
  constructor(private readonly connection: DatabaseConnection) {
    this.ensureDefaultProject();
  }

  /**
   * Ensures the default project rather than inserting it: OR IGNORE is what makes
   * booting repeatedly against one database leave exactly one row and never
   * overwrite a default the user has since renamed (OR REPLACE would silently
   * reset it; a plain INSERT would collide on the primary key).
   *
   * Runs in the constructor — the direct analogue of the field initializer it
   * replaced — so no method can observe a missing default, regardless of whether
   * a caller initialises the application.
   */
  private ensureDefaultProject(): void {
    this.connection.db
      .prepare(
        `INSERT OR IGNORE INTO projects (${COLUMNS}) VALUES (@id, @name, @key)`,
      )
      .run({ id: DEFAULT_PROJECT_ID, name: 'Default', key: 'DEF' });
  }

  // ORDER BY rowid keeps the insertion order callers saw when this was an array.
  findAll(): Project[] {
    return this.connection.db
      .prepare(`SELECT ${COLUMNS} FROM projects ORDER BY rowid`)
      .all() as Project[];
  }

  exists(id: string): boolean {
    const row = this.connection.db
      .prepare('SELECT 1 FROM projects WHERE id = ?')
      .get(id);
    return row !== undefined;
  }

  create(data: { name: string; key: string }): Project {
    const project: Project = {
      id: randomUUID(),
      name: data.name,
      key: data.key,
    };
    this.connection.db
      .prepare(`INSERT INTO projects (${COLUMNS}) VALUES (@id, @name, @key)`)
      .run(project);
    return project;
  }
}

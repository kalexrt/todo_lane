import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseConnection } from '../database/database';
import { DEFAULT_PROJECT_ID } from '../projects/project.entity';
import { ProjectsService } from '../projects/projects.service';
import { Ticket, TicketStatus } from './ticket.entity';

export { DEFAULT_PROJECT_ID };

const COLUMNS = 'id, projectId, title, description, status';

@Injectable()
export class TicketsService {
  constructor(
    private readonly projects: ProjectsService,
    private readonly connection: DatabaseConnection,
  ) {}

  // ORDER BY rowid keeps the insertion order callers saw when this was an array.
  findAll(projectId?: string): Ticket[] {
    if (projectId === undefined) {
      return this.connection.db
        .prepare(`SELECT ${COLUMNS} FROM tickets ORDER BY rowid`)
        .all() as Ticket[];
    }
    return this.connection.db
      .prepare(`SELECT ${COLUMNS} FROM tickets WHERE projectId = ? ORDER BY rowid`)
      .all(projectId) as Ticket[];
  }

  /** Raw domain seam — no referential-integrity check. Used internally and by tests seeding tickets directly. */
  create(data: {
    title: string;
    description?: string;
    projectId?: string;
  }): Ticket {
    const ticket: Ticket = {
      id: randomUUID(),
      projectId: data.projectId ?? DEFAULT_PROJECT_ID,
      title: data.title,
      description: data.description ?? '',
      status: 'todo',
    };
    this.connection.db
      .prepare(
        `INSERT INTO tickets (${COLUMNS}) VALUES (@id, @projectId, @title, @description, @status)`,
      )
      .run(ticket);
    return ticket;
  }

  /** HTTP-facing create: rejects a projectId that names no existing project. */
  createValidated(data: {
    title: string;
    description?: string;
    projectId?: string;
  }): Ticket {
    const projectId = data.projectId ?? DEFAULT_PROJECT_ID;
    if (!this.projects.exists(projectId)) {
      throw new BadRequestException(`Unknown projectId: ${projectId}`);
    }
    return this.create({ ...data, projectId });
  }

  /** The only code path that mutates a ticket's status — future transition rules gate here. */
  updateStatus(id: string, status: TicketStatus): Ticket {
    const ticket = this.connection.db
      .prepare(`SELECT ${COLUMNS} FROM tickets WHERE id = ?`)
      .get(id) as Ticket | undefined;
    // 404 before any write — a rejected request must persist nothing.
    if (!ticket) {
      throw new NotFoundException(`Unknown ticket id: ${id}`);
    }
    this.connection.db
      .prepare('UPDATE tickets SET status = ? WHERE id = ?')
      .run(status, id);
    return { ...ticket, status };
  }
}

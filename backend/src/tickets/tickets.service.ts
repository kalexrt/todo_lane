import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DEFAULT_PROJECT_ID } from '../projects/project.entity';
import { ProjectsService } from '../projects/projects.service';
import { Ticket } from './ticket.entity';

export { DEFAULT_PROJECT_ID };

@Injectable()
export class TicketsService {
  private readonly tickets: Ticket[] = [];

  constructor(private readonly projects: ProjectsService) {}

  findAll(projectId?: string): Ticket[] {
    if (projectId === undefined) {
      return this.tickets;
    }
    return this.tickets.filter((ticket) => ticket.projectId === projectId);
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
    this.tickets.push(ticket);
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
}

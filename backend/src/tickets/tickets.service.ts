import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Ticket } from './ticket.entity';

export const DEFAULT_PROJECT_ID = 'default';

@Injectable()
export class TicketsService {
  private readonly tickets: Ticket[] = [];

  findAll(projectId?: string): Ticket[] {
    if (projectId === undefined) {
      return this.tickets;
    }
    return this.tickets.filter((ticket) => ticket.projectId === projectId);
  }

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
}

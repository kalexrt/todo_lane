import { Controller, Get, Query } from '@nestjs/common';
import { Ticket } from './ticket.entity';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string): Ticket[] {
    return this.tickets.findAll(projectId);
  }
}

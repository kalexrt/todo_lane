import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { DEFAULT_PROJECT_ID } from './tickets.service';
import { Ticket } from './ticket.entity';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly tickets: TicketsService,
    private readonly projects: ProjectsService,
  ) {}

  @Get()
  findAll(@Query('projectId') projectId?: string): Ticket[] {
    return this.tickets.findAll(projectId);
  }

  @Post()
  create(@Body() dto: CreateTicketDto): Ticket {
    const projectId = dto.projectId ?? DEFAULT_PROJECT_ID;
    if (!this.projects.findAll().some((project) => project.id === projectId)) {
      throw new BadRequestException(`Unknown projectId: ${projectId}`);
    }
    return this.tickets.create(dto);
  }
}

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './ticket.entity';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string): Ticket[] {
    return this.tickets.findAll(projectId);
  }

  @Post()
  create(@Body() dto: CreateTicketDto): Ticket {
    return this.tickets.create(dto);
  }
}

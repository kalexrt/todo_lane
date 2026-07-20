import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import type { Ticket } from './ticket.entity';
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
    return this.tickets.createValidated(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ): Ticket {
    return this.tickets.updateStatus(id, dto.status);
  }
}

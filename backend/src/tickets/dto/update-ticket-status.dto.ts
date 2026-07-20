import { IsIn } from 'class-validator';
import { TICKET_STATUSES } from '../ticket.entity';
import type { TicketStatus } from '../ticket.entity';

export class UpdateTicketStatusDto {
  @IsIn(TICKET_STATUSES)
  status: TicketStatus;
}

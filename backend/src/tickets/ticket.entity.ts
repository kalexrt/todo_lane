export const TICKET_STATUSES = ['todo', 'in_progress', 'done'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export interface Ticket {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TicketStatus;
}

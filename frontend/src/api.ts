export const TICKET_STATUSES = ['todo', 'in_progress', 'done'] as const

export type TicketStatus = (typeof TICKET_STATUSES)[number]

export interface Ticket {
  id: string
  projectId: string
  title: string
  description: string
  status: TicketStatus
}

export async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch('/api/tickets')
  if (!res.ok) {
    throw new Error(`GET /api/tickets failed: ${res.status}`)
  }
  return res.json() as Promise<Ticket[]>
}

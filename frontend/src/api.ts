export const TICKET_STATUSES = ['todo', 'in_progress', 'done'] as const

export type TicketStatus = (typeof TICKET_STATUSES)[number]

export interface Ticket {
  id: string
  projectId: string
  title: string
  description: string
  status: TicketStatus
}

export interface Project {
  id: string
  name: string
  key: string
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects')
  if (!res.ok) {
    throw new Error(`GET /api/projects failed: ${res.status}`)
  }
  return res.json() as Promise<Project[]>
}

export async function createProject(data: {
  name: string
  key: string
}): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(`POST /api/projects failed: ${res.status}`)
  }
  return res.json() as Promise<Project>
}

export async function fetchTickets(projectId?: string): Promise<Ticket[]> {
  const url =
    projectId === undefined ? '/api/tickets' : `/api/tickets?projectId=${projectId}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`GET /api/tickets failed: ${res.status}`)
  }
  return res.json() as Promise<Ticket[]>
}

export async function createTicket(data: {
  title: string
  description?: string
  projectId?: string
}): Promise<Ticket> {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(`POST /api/tickets failed: ${res.status}`)
  }
  return res.json() as Promise<Ticket>
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  const res = await fetch(`/api/tickets/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    throw new Error(`PATCH /api/tickets/${id}/status failed: ${res.status}`)
  }
  return res.json() as Promise<Ticket>
}

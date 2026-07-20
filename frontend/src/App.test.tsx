import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import App from './App'
import type { Ticket } from './api'

function stubTicketsApi(tickets: Ticket[]) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => tickets,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('board (T-002 B-3)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the three status columns', async () => {
    stubTicketsApi([])
    render(<App />)

    expect(
      await screen.findByRole('region', { name: 'To Do' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Done' })).toBeInTheDocument()
  })

  it('places each fetched ticket in the column matching its status', async () => {
    stubTicketsApi([
      { id: 't1', projectId: 'default', title: 'Write spec', description: '', status: 'todo' },
      { id: 't2', projectId: 'default', title: 'Build board', description: '', status: 'in_progress' },
      { id: 't3', projectId: 'default', title: 'Ship scaffold', description: '', status: 'done' },
    ])
    render(<App />)

    const todo = await screen.findByRole('region', { name: 'To Do' })
    const inProgress = screen.getByRole('region', { name: 'In Progress' })
    const done = screen.getByRole('region', { name: 'Done' })

    expect(await within(todo).findByText('Write spec')).toBeInTheDocument()
    expect(within(inProgress).getByText('Build board')).toBeInTheDocument()
    expect(within(done).getByText('Ship scaffold')).toBeInTheDocument()

    expect(within(todo).queryByText('Build board')).not.toBeInTheDocument()
    expect(within(todo).queryByText('Ship scaffold')).not.toBeInTheDocument()
  })

  it('renders an empty board from an empty payload — no local seed data', async () => {
    const fetchMock = stubTicketsApi([])
    render(<App />)

    const todo = await screen.findByRole('region', { name: 'To Do' })
    expect(within(todo).queryAllByRole('listitem')).toHaveLength(0)
    expect(fetchMock).toHaveBeenCalledWith('/api/tickets')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import App from './App'
import type { Project, Ticket } from './api'

const DEFAULT_PROJECT: Project = { id: 'default', name: 'Default', key: 'DEF' }

/**
 * Stubs the board API for the single-board cases: `GET /api/projects` returns
 * the default project, and `GET /api/tickets?projectId=default` returns the
 * given tickets. Any other URL is rejected so a stray request surfaces.
 */
function stubBoardsApi(tickets: Ticket[]) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url === '/api/projects' && (!init || init.method === undefined)) {
      return Promise.resolve({ ok: true, json: async () => [DEFAULT_PROJECT] })
    }
    if (url === '/api/tickets?projectId=default' && (!init || init.method === undefined)) {
      return Promise.resolve({ ok: true, json: async () => tickets })
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('board (T-002 B-3)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the three status columns', async () => {
    stubBoardsApi([])
    render(<App />)

    expect(
      await screen.findByRole('region', { name: 'To Do' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'In Progress' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Done' })).toBeInTheDocument()
  })

  it('places each fetched ticket in the column matching its status', async () => {
    stubBoardsApi([
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
    const fetchMock = stubBoardsApi([])
    render(<App />)

    // the active board must be resolved before the filtered fetch is issued
    await screen.findByRole('combobox', { name: /board/i })
    const todo = screen.getByRole('region', { name: 'To Do' })
    expect(within(todo).queryAllByRole('listitem')).toHaveLength(0)
    expect(fetchMock).toHaveBeenCalledWith('/api/tickets?projectId=default')
  })
})

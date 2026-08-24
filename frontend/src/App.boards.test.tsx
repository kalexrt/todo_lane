import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import App from './App'
import type { Project, Ticket } from './api'

const DEFAULT_PROJECT: Project = { id: 'default', name: 'Default', key: 'DEF' }
const SECOND_PROJECT: Project = { id: 'p2', name: 'Second', key: 'SEC' }

/**
 * Stubs `fetch` for the multi-board API: GET /api/projects returns the given
 * projects, and GET /api/tickets?projectId=<id> returns the tickets mapped to
 * that project id. Any other URL is rejected so a stray request surfaces.
 */
function stubBoardsApi(
  projects: Project[],
  ticketsByProject: Record<string, Ticket[]>,
) {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()

    if (url === '/api/projects' && (!init || init.method === undefined)) {
      return Promise.resolve({ ok: true, json: async () => projects })
    }

    const ticketMatch = url.match(/^\/api\/tickets(?:\?projectId=(.+))?$/)
    if (ticketMatch && (!init || init.method === undefined)) {
      const projectId = ticketMatch[1] ?? 'default'
      const tickets = ticketsByProject[projectId] ?? []
      return Promise.resolve({ ok: true, json: async () => tickets })
    }

    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('multiple boards (T-multiple-boards-custom-columns-6qfm6y B-1)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists every project as a board and shows only the active board’s tickets', async () => {
    const fetchMock = stubBoardsApi(
      [DEFAULT_PROJECT, SECOND_PROJECT],
      {
        default: [
          { id: 't1', projectId: 'default', title: 'Default ticket', description: '', status: 'todo' },
        ],
        p2: [
          { id: 't2', projectId: 'p2', title: 'Second ticket', description: '', status: 'todo' },
        ],
      },
    )
    render(<App />)

    // the board selector lists both projects, with Default active
    const boardSelect = await screen.findByRole('combobox', { name: /board/i })
    expect(within(boardSelect).getByRole('option', { name: 'Default' })).toBeInTheDocument()
    expect(within(boardSelect).getByRole('option', { name: 'Second' })).toBeInTheDocument()
    expect((boardSelect as HTMLSelectElement).value).toBe('default')

    // the active board's tickets are fetched with ?projectId= and rendered
    expect(fetchMock).toHaveBeenCalledWith('/api/tickets?projectId=default')
    const todo = screen.getByRole('region', { name: 'To Do' })
    expect(await within(todo).findByText('Default ticket')).toBeInTheDocument()
    expect(within(todo).queryByText('Second ticket')).not.toBeInTheDocument()
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('create board (T-multiple-boards-custom-columns-6qfm6y B-2)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates a new board that appears in the selector, is selectable, and starts empty', async () => {
    const user = userEvent.setup()
    const projects: Project[] = [DEFAULT_PROJECT]
    const ticketsByProject: Record<string, Ticket[]> = { default: [] }

    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === '/api/projects' && (!init || init.method === undefined)) {
        return Promise.resolve({ ok: true, json: async () => projects.map((p) => ({ ...p })) })
      }
      if (url === '/api/projects' && init?.method === 'POST') {
        const body = JSON.parse(init.body as string)
        const created: Project = { id: 'p3', name: body.name, key: body.key }
        projects.push(created)
        return Promise.resolve({ ok: true, json: async () => ({ ...created }) })
      }
      const ticketMatch = url.match(/^\/api\/tickets(?:\?projectId=(.+))?$/)
      if (ticketMatch && (!init || init.method === undefined)) {
        const projectId = ticketMatch[1] ?? 'default'
        return Promise.resolve({ ok: true, json: async () => ticketsByProject[projectId] ?? [] })
      }
      return Promise.reject(new Error(`unexpected fetch: ${url}`))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    await screen.findByRole('combobox', { name: /board/i })

    await user.type(screen.getByLabelText('Board name'), 'New Board')
    await user.type(screen.getByLabelText('Board key'), 'NEW')
    await user.click(screen.getByRole('button', { name: /create board/i }))

    // the new board is POSTed and then appears in the selector
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/projects',
      expect.objectContaining({ method: 'POST' }),
    )
    const select = await screen.findByRole('combobox', { name: /board/i })
    expect(within(select).getByRole('option', { name: 'New Board' })).toBeInTheDocument()

    // it is selectable and starts with no tickets
    await user.selectOptions(select, 'p3')
    expect((select as HTMLSelectElement).value).toBe('p3')
    const todo = screen.getByRole('region', { name: 'To Do' })
    expect(within(todo).queryAllByRole('listitem')).toHaveLength(0)
  })
})

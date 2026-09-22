import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import type { Ticket } from './api'

interface StatusCall {
  id: string
  status: string
}

/** Stateful fake of the REST boundary, mirroring App.move.test.tsx. */
function stubStatefulApi(initialTickets: Ticket[]) {
  const serverTickets: Ticket[] = initialTickets.map((t) => ({ ...t }))
  const statusCalls: StatusCall[] = []

  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    const match = url.match(/^\/api\/tickets\/([^/]+)\/status$/)

    if (url === '/api/tickets' && (!init || init.method === undefined)) {
      return Promise.resolve({ ok: true, json: async () => serverTickets.map((t) => ({ ...t })) })
    }
    if (match && init?.method === 'PATCH') {
      const ticket = serverTickets.find((t) => t.id === match[1])
      const body = JSON.parse(init.body as string)
      statusCalls.push({ id: match[1], status: body.status })
      if (ticket) ticket.status = body.status
      return Promise.resolve({ ok: true, json: async () => ({ ...ticket }) })
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })

  vi.stubGlobal('fetch', fetchMock)
  return statusCalls
}

/** jsdom implements no DataTransfer, so carry the drag payload in a stand-in. */
function makeDataTransfer() {
  const store = new Map<string, string>()
  return {
    setData: (format: string, value: string) => void store.set(format, value),
    getData: (format: string) => store.get(format) ?? '',
    dropEffect: 'move',
    effectAllowed: 'move',
    types: [] as string[],
  }
}

function cardFor(title: string): HTMLElement {
  const card = screen.getByText(title).closest('li')
  if (!card) throw new Error(`no card element for "${title}"`)
  return card
}

describe('drag a ticket onto a column (T-drag-ticket-between-columns-wx3fbc B-1)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('moves the ticket to the column it is dropped on and requests that status change', async () => {
    const statusCalls = stubStatefulApi([
      { id: 't1', projectId: 'default', title: 'Draggable ticket', description: '', status: 'todo' },
    ])

    render(<App />)

    const todo = await screen.findByRole('region', { name: 'To Do' })
    await within(todo).findByText('Draggable ticket')

    const done = screen.getByRole('region', { name: 'Done' })
    const dataTransfer = makeDataTransfer()

    fireEvent.dragStart(cardFor('Draggable ticket'), { dataTransfer })
    fireEvent.dragOver(done, { dataTransfer })
    fireEvent.drop(done, { dataTransfer })

    expect(await within(done).findByText('Draggable ticket')).toBeInTheDocument()
    expect(within(todo).queryByText('Draggable ticket')).not.toBeInTheDocument()
    expect(statusCalls).toEqual([{ id: 't1', status: 'done' }])
  })
})

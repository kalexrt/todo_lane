import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import type { Ticket } from './api'

function stubStatefulApi(initialTickets: Ticket[]) {
  const serverTickets: Ticket[] = initialTickets.map((t) => ({ ...t }))

  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    const match = url.match(/^\/api\/tickets\/([^/]+)\/status$/)

    if (url === '/api/tickets' && (!init || init.method === undefined)) {
      return Promise.resolve({ ok: true, json: async () => serverTickets.map((t) => ({ ...t })) })
    }
    if (match && init?.method === 'PATCH') {
      const ticket = serverTickets.find((t) => t.id === match[1])
      const body = JSON.parse(init.body as string)
      if (ticket) ticket.status = body.status
      return Promise.resolve({ ok: true, json: async () => ({ ...ticket }) })
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })

  vi.stubGlobal('fetch', fetchMock)
  return serverTickets
}

describe('move a ticket between statuses (T-004 B-3)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('moves the card to the target column and it survives a re-render from the same server state', async () => {
    const user = userEvent.setup()
    stubStatefulApi([
      { id: 't1', projectId: 'default', title: 'Movable ticket', description: '', status: 'todo' },
    ])

    const { unmount } = render(<App />)

    const todo = await screen.findByRole('region', { name: 'To Do' })
    await within(todo).findByText('Movable ticket')

    await user.click(
      within(todo).getByRole('button', { name: /in progress/i }),
    )

    const inProgress = screen.getByRole('region', { name: 'In Progress' })
    expect(await within(inProgress).findByText('Movable ticket')).toBeInTheDocument()
    expect(within(todo).queryByText('Movable ticket')).not.toBeInTheDocument()

    // simulate a page refresh: unmount and render fresh against the same faked server state
    unmount()
    render(<App />)

    const inProgressAfterReload = await screen.findByRole('region', { name: 'In Progress' })
    expect(
      await within(inProgressAfterReload).findByText('Movable ticket'),
    ).toBeInTheDocument()
  })
})

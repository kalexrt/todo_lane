import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import type { Ticket } from './api'

function stubApiForCreate() {
  const createdTicket: Ticket = {
    id: 'new-ticket',
    projectId: 'default',
    title: 'Write the create form',
    description: 'drive it via TDD',
    status: 'todo',
  }

  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url === '/api/tickets' && (!init || init.method === undefined)) {
      return Promise.resolve({ ok: true, json: async () => [] })
    }
    if (url === '/api/tickets' && init?.method === 'POST') {
      return Promise.resolve({ ok: true, json: async () => createdTicket })
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })

  vi.stubGlobal('fetch', fetchMock)
  return { fetchMock, createdTicket }
}

describe('create ticket form (T-003 B-4)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds the new ticket to To Do without a manual reload, and clears the form', async () => {
    const user = userEvent.setup()
    stubApiForCreate()
    render(<App />)

    await screen.findByRole('region', { name: 'To Do' })

    const titleInput = screen.getByLabelText('Title')
    const descriptionInput = screen.getByLabelText('Description')

    await user.type(titleInput, 'Write the create form')
    await user.type(descriptionInput, 'drive it via TDD')
    await user.click(screen.getByRole('button', { name: /create/i }))

    const todo = screen.getByRole('region', { name: 'To Do' })
    expect(
      await within(todo).findByText('Write the create form'),
    ).toBeInTheDocument()

    expect(titleInput).toHaveValue('')
    expect(descriptionInput).toHaveValue('')
  })
})

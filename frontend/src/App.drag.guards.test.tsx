import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import type { Ticket } from './api'

/**
 * Guards for the real-browser drag mechanics that App.drag.test.tsx cannot see.
 * jsdom fires `drop` unconditionally and `dragStart` on any element, so the
 * behavioural tests stay green even if the column stops accepting drops or the
 * card stops being a drag source. These lock those down directly.
 */
function stubApi(tickets: Ticket[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === '/api/tickets') {
        return Promise.resolve({ ok: true, json: async () => tickets })
      }
      return Promise.reject(new Error(`unexpected fetch: ${url}`))
    }),
  )
}

function makeDataTransfer() {
  const store = new Map<string, string>()
  return {
    setData: (format: string, value: string) => void store.set(format, value),
    getData: (format: string) => store.get(format) ?? '',
  }
}

const ONE_TODO: Ticket[] = [
  { id: 't1', projectId: 'default', title: 'Guarded ticket', description: '', status: 'todo' },
]

describe('drag mechanics guards (regression)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('marks ticket cards as drag sources', async () => {
    stubApi(ONE_TODO)
    render(<App />)

    const card = (await screen.findByText('Guarded ticket')).closest('li')
    expect(card).toHaveAttribute('draggable', 'true')
  })

  it('accepts drops by preventing the default on dragover', async () => {
    stubApi(ONE_TODO)
    render(<App />)

    const done = await screen.findByRole('region', { name: 'Done' })
    // fireEvent returns false when the handler called preventDefault — without
    // that, the browser rejects every drop and `drop` never fires at all.
    expect(fireEvent.dragOver(done, { dataTransfer: makeDataTransfer() })).toBe(false)
  })

  it('highlights the column under the pointer and clears it when the drag leaves', async () => {
    stubApi(ONE_TODO)
    render(<App />)

    const done = await screen.findByRole('region', { name: 'Done' })
    const todo = screen.getByRole('region', { name: 'To Do' })
    const dataTransfer = makeDataTransfer()

    expect(done).not.toHaveClass('drop-target')

    fireEvent.dragStart(within(todo).getByText('Guarded ticket').closest('li')!, { dataTransfer })
    fireEvent.dragOver(done, { dataTransfer })
    expect(done).toHaveClass('drop-target')
    expect(todo).not.toHaveClass('drop-target')

    fireEvent.dragLeave(done, { dataTransfer })
    expect(done).not.toHaveClass('drop-target')
  })

  it('clears the highlight when the drag ends without a drop', async () => {
    stubApi(ONE_TODO)
    render(<App />)

    const done = await screen.findByRole('region', { name: 'Done' })
    const todo = screen.getByRole('region', { name: 'To Do' })
    const dataTransfer = makeDataTransfer()
    const card = within(todo).getByText('Guarded ticket').closest('li')!

    fireEvent.dragStart(card, { dataTransfer })
    fireEvent.dragOver(done, { dataTransfer })
    expect(done).toHaveClass('drop-target')

    fireEvent.dragEnd(card, { dataTransfer })
    expect(done).not.toHaveClass('drop-target')
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import type { Ticket } from './api'

function stubTicketsApi(tickets: Ticket[] = []) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => tickets }),
  )
}

function stubMatchMedia(prefersDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' && prefersDark,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

describe('theme resolution on mount (T-light-mode-theme-1n8w9z B-1)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    stubTicketsApi()
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('resolves to dark and offers a switch-to-light control when the OS prefers dark and nothing is stored', async () => {
    stubMatchMedia(true)

    render(<App />)

    expect(await screen.findByRole('region', { name: 'To Do' })).toBeInTheDocument()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(
      screen.getByRole('button', { name: /switch to light/i }),
    ).toBeInTheDocument()
  })

  it('resolves to light and offers a switch-to-dark control when the OS does not prefer dark and nothing is stored', async () => {
    stubMatchMedia(false)

    render(<App />)

    expect(await screen.findByRole('region', { name: 'To Do' })).toBeInTheDocument()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(
      screen.getByRole('button', { name: /switch to dark/i }),
    ).toBeInTheDocument()
  })
})

describe('theme toggle interaction (T-light-mode-theme-1n8w9z B-2)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    stubTicketsApi()
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('flips the active theme on click and flips back on a second click', async () => {
    stubMatchMedia(true)
    const user = userEvent.setup()

    render(<App />)

    await screen.findByRole('region', { name: 'To Do' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    await user.click(screen.getByRole('button', { name: /switch to light/i }))

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(
      screen.getByRole('button', { name: /switch to dark/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /switch to dark/i }))

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(
      screen.getByRole('button', { name: /switch to light/i }),
    ).toBeInTheDocument()
  })
})

describe('theme persistence across mounts (T-light-mode-theme-1n8w9z B-3)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    stubTicketsApi()
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('persists the flipped theme to localStorage and a stored value wins over the OS preference on the next mount', async () => {
    stubMatchMedia(true)
    const user = userEvent.setup()

    const { unmount } = render(<App />)

    await screen.findByRole('region', { name: 'To Do' })
    await user.click(screen.getByRole('button', { name: /switch to light/i }))

    expect(localStorage.getItem('theme')).toBe('light')

    unmount()
    document.documentElement.removeAttribute('data-theme')

    render(<App />)

    await screen.findByRole('region', { name: 'To Do' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(
      screen.getByRole('button', { name: /switch to dark/i }),
    ).toBeInTheDocument()
  })
})

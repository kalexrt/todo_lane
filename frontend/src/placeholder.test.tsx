import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('toolchain placeholder (T-001)', () => {
  it('vitest + RTL run in the frontend package', () => {
    render(<p>toolchain works</p>)
    expect(screen.getByText('toolchain works')).toBeInTheDocument()
  })
})

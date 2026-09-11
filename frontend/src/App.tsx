import { useCallback, useEffect, useState } from 'react'
import { fetchTickets, updateTicketStatus } from './api'
import type { Ticket, TicketStatus } from './api'
import CreateTicketForm from './CreateTicketForm'
import { otherTheme, resolveInitialTheme } from './theme'
import './App.css'

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [theme] = useState(resolveInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const loadTickets = useCallback(() => {
    fetchTickets().then(setTickets).catch(console.error)
  }, [])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  async function moveTicket(id: string, status: TicketStatus) {
    await updateTicketStatus(id, status)
    loadTickets()
  }

  return (
    <main>
      <div className="page-header">
        <h1>Ticket Tracker</h1>
        <button
          type="button"
          className="theme-toggle"
          aria-label={`Switch to ${otherTheme(theme)} theme`}
        >
          {otherTheme(theme) === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
      <CreateTicketForm onCreated={loadTickets} />
      <div className="board">
        {COLUMNS.map(({ status, label }) => (
          <section key={status} aria-label={label} className="column">
            <h2>{label}</h2>
            <ul>
              {tickets
                .filter((ticket) => ticket.status === status)
                .map((ticket) => (
                  <li key={ticket.id} className="ticket">
                    <strong>{ticket.title}</strong>
                    {ticket.description && <p>{ticket.description}</p>}
                    <div className="ticket-actions">
                      {COLUMNS.filter((column) => column.status !== ticket.status).map(
                        (column) => (
                          <button
                            key={column.status}
                            type="button"
                            onClick={() => moveTicket(ticket.id, column.status)}
                          >
                            Move to {column.label}
                          </button>
                        ),
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}

export default App

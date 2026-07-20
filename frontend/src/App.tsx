import { useCallback, useEffect, useState } from 'react'
import { fetchTickets } from './api'
import type { Ticket, TicketStatus } from './api'
import CreateTicketForm from './CreateTicketForm'
import './App.css'

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([])

  const loadTickets = useCallback(() => {
    fetchTickets().then(setTickets).catch(console.error)
  }, [])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  return (
    <main>
      <h1>Ticket Tracker</h1>
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

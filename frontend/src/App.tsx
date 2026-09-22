import { useCallback, useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import { fetchTickets, updateTicketStatus } from './api'
import type { Ticket, TicketStatus } from './api'
import CreateTicketForm from './CreateTicketForm'
import { otherTheme, resolveInitialTheme, setStoredTheme } from './theme'
import './App.css'

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

const DRAG_FORMAT = 'text/plain'

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [theme, setTheme] = useState(resolveInitialTheme)
  const [dropTarget, setDropTarget] = useState<TicketStatus | null>(null)

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

  function handleDrop(event: DragEvent, status: TicketStatus) {
    event.preventDefault()
    setDropTarget(null)
    const id = event.dataTransfer.getData(DRAG_FORMAT)
    if (!id) return
    const dropped = tickets.find((ticket) => ticket.id === id)
    // dropping a card back on its own column is a no-op, not a redundant PATCH
    if (!dropped || dropped.status === status) return
    moveTicket(id, status)
  }

  return (
    <main>
      <div className="page-header">
        <h1>Ticket Tracker</h1>
        <button
          type="button"
          className="theme-toggle"
          aria-label={`Switch to ${otherTheme(theme)} theme`}
          onClick={() =>
            setTheme((current) => {
              const next = otherTheme(current)
              setStoredTheme(next)
              return next
            })
          }
        >
          {otherTheme(theme) === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
      <CreateTicketForm onCreated={loadTickets} />
      <div className="board">
        {COLUMNS.map(({ status, label }) => (
          <section
            key={status}
            aria-label={label}
            className={dropTarget === status ? 'column drop-target' : 'column'}
            onDragOver={(event) => {
              event.preventDefault()
              setDropTarget(status)
            }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(event) => handleDrop(event, status)}
          >
            <h2>{label}</h2>
            <ul>
              {tickets
                .filter((ticket) => ticket.status === status)
                .map((ticket) => (
                  <li
                    key={ticket.id}
                    className="ticket"
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData(DRAG_FORMAT, ticket.id)
                    }
                    onDragEnd={() => setDropTarget(null)}
                  >
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

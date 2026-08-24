import { useCallback, useEffect, useState } from 'react'
import { fetchProjects, fetchTickets, updateTicketStatus } from './api'
import type { Project, Ticket, TicketStatus } from './api'
import CreateTicketForm from './CreateTicketForm'
import './App.css'

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(undefined)
  const [tickets, setTickets] = useState<Ticket[]>([])

  // Load the board list once on mount. The first project is the default board —
  // activate it in the same batch so the selector never renders an empty/undefined
  // active board once the list has arrived.
  useEffect(() => {
    fetchProjects()
      .then((loaded) => {
        setProjects(loaded)
        if (activeProjectId === undefined && loaded.length > 0) {
          setActiveProjectId(loaded[0].id)
        }
      })
      .catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTickets = useCallback(() => {
    if (activeProjectId === undefined) return
    fetchTickets(activeProjectId).then(setTickets).catch(console.error)
  }, [activeProjectId])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  async function moveTicket(id: string, status: TicketStatus) {
    await updateTicketStatus(id, status)
    loadTickets()
  }

  return (
    <main>
      <h1>Ticket Tracker</h1>
      {projects.length > 0 && (
        <div className="board-selector">
          <label htmlFor="board-select">Board</label>
          <select
            id="board-select"
            value={activeProjectId ?? ''}
            onChange={(event) => setActiveProjectId(event.target.value)}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}
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

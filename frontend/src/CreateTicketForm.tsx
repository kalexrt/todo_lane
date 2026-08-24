import { useState } from 'react'
import type { FormEvent } from 'react'
import { createTicket } from './api'

interface CreateTicketFormProps {
  onCreated: () => void
  projectId?: string
}

function CreateTicketForm({ onCreated, projectId }: CreateTicketFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await createTicket({ title, description, projectId })
    setTitle('')
    setDescription('')
    onCreated()
  }

  return (
    <form onSubmit={handleSubmit} className="create-ticket-form">
      <label htmlFor="ticket-title">Title</label>
      <input
        id="ticket-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
      <label htmlFor="ticket-description">Description</label>
      <input
        id="ticket-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button type="submit">Create ticket</button>
    </form>
  )
}

export default CreateTicketForm

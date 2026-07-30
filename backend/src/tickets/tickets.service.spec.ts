import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  DatabaseConnection,
  EPHEMERAL_DATABASE,
  openDatabase,
} from '../database/database';
import { DEFAULT_PROJECT_ID } from '../projects/project.entity';
import { ProjectsService } from '../projects/projects.service';
import { TicketsService } from './tickets.service';

/** The real driver against a real ephemeral database — never a fake. */
function connect(): DatabaseConnection {
  return { db: openDatabase(EPHEMERAL_DATABASE) } as DatabaseConnection;
}

function build(connection: DatabaseConnection): TicketsService {
  return new TicketsService(new ProjectsService(connection), connection);
}

describe('TicketsService persistence (T-sqlite-persistence-tp1eij)', () => {
  let connection: DatabaseConnection;
  let tickets: TicketsService;

  beforeEach(() => {
    connection = connect();
    tickets = build(connection);
  });

  afterEach(() => {
    connection.db.close();
  });

  it('round-trips a created ticket with identical fields and the exact status string', () => {
    const created = tickets.create({
      title: 'Round Trip',
      description: 'every field survives',
    });

    expect(tickets.findAll()).toEqual([
      {
        id: created.id,
        projectId: DEFAULT_PROJECT_ID,
        title: 'Round Trip',
        description: 'every field survives',
        status: 'todo',
      },
    ]);
    // The literal union member, not a numeric code or display string.
    expect(tickets.findAll()[0].status).toBe('todo');
  });

  it('stores an empty description when none is supplied', () => {
    const created = tickets.create({ title: 'No description' });
    expect(tickets.findAll().find((t) => t.id === created.id)?.description).toBe(
      '',
    );
  });

  it('filters by project and preserves insertion order', () => {
    const first = tickets.create({ title: 'first' });
    const second = tickets.create({ title: 'second' });
    const elsewhere = tickets.create({
      title: 'elsewhere',
      projectId: 'other-project',
    });

    expect(tickets.findAll().map((t) => t.id)).toEqual([
      first.id,
      second.id,
      elsewhere.id,
    ]);
    expect(tickets.findAll(DEFAULT_PROJECT_ID).map((t) => t.id)).toEqual([
      first.id,
      second.id,
    ]);
    expect(tickets.findAll('other-project').map((t) => t.id)).toEqual([
      elsewhere.id,
    ]);
    expect(tickets.findAll('no-such-project')).toEqual([]);
  });

  it('writes a status change through, touching only that ticket and only its status', () => {
    const moved = tickets.create({ title: 'moved', description: 'keeps this' });
    const untouched = tickets.create({ title: 'untouched' });

    expect(tickets.updateStatus(moved.id, 'done').status).toBe('done');

    expect(tickets.findAll().find((t) => t.id === moved.id)).toEqual({
      id: moved.id,
      projectId: DEFAULT_PROJECT_ID,
      title: 'moved',
      description: 'keeps this',
      status: 'done',
    });
    expect(tickets.findAll().find((t) => t.id === untouched.id)?.status).toBe(
      'todo',
    );
  });

  it('rejects an unknown projectId without writing anything', () => {
    expect(() =>
      tickets.createValidated({ title: 'Orphan', projectId: 'no-such-project' }),
    ).toThrow(BadRequestException);

    expect(tickets.findAll()).toEqual([]);
  });

  it('rejects an unknown ticket id without writing anything', () => {
    const existing = tickets.create({ title: 'existing' });

    expect(() => tickets.updateStatus('no-such-ticket', 'done')).toThrow(
      NotFoundException,
    );

    // No row invented, and the real ticket untouched.
    expect(tickets.findAll()).toHaveLength(1);
    expect(tickets.findAll()[0]).toEqual({
      id: existing.id,
      projectId: DEFAULT_PROJECT_ID,
      title: 'existing',
      description: '',
      status: 'todo',
    });
  });
});

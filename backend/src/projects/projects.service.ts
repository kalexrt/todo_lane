import { Injectable } from '@nestjs/common';
import { DEFAULT_PROJECT_ID } from '../tickets/tickets.service';
import { Project } from './project.entity';

@Injectable()
export class ProjectsService {
  private readonly projects: Project[] = [
    { id: DEFAULT_PROJECT_ID, name: 'Default', key: 'DEF' },
  ];

  findAll(): Project[] {
    return this.projects;
  }
}

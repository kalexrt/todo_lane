import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DEFAULT_PROJECT_ID, Project } from './project.entity';

@Injectable()
export class ProjectsService {
  private readonly projects: Project[] = [
    { id: DEFAULT_PROJECT_ID, name: 'Default', key: 'DEF' },
  ];

  findAll(): Project[] {
    return this.projects;
  }

  exists(id: string): boolean {
    return this.projects.some((project) => project.id === id);
  }

  create(data: { name: string; key: string }): Project {
    const project: Project = {
      id: randomUUID(),
      name: data.name,
      key: data.key,
    };
    this.projects.push(project);
    return project;
  }
}

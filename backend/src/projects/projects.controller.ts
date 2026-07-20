import { Controller, Get } from '@nestjs/common';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(): Project[] {
    return this.projects.findAll();
  }
}

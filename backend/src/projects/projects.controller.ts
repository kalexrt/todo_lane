import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(): Project[] {
    return this.projects.findAll();
  }

  @Post()
  create(@Body() dto: CreateProjectDto): Project {
    return this.projects.create(dto);
  }
}

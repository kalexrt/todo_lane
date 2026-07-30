import { Module } from '@nestjs/common';
import { DatabaseConnection } from './database';

/**
 * Imported by both domain modules; Nest shares the single provider instance,
 * so one connection handle serves the whole application.
 */
@Module({
  providers: [DatabaseConnection],
  exports: [DatabaseConnection],
})
export class DatabaseModule {}

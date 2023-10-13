import { Module } from '@nestjs/common';
import { DashboardsModule } from './dashboards/dashboards.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DBOptions } from 'db.datasourceoptions';

@Module({
  imports: [
    DashboardsModule,
    /* Config docs: https://docs.nestjs.com/techniques/database */
    TypeOrmModule.forRootAsync({
      useFactory: (_) => { /* Dynamic datasource creation */
        return DBOptions as TypeOrmModuleOptions;
      } }),
  ],
})
export class AppModule {}

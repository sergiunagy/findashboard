import { Module } from '@nestjs/common';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from 'src/model/dashboard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dashboard])],
  controllers: [DashboardsController],
  providers: [DashboardsService]
})
export class DashboardsModule {}

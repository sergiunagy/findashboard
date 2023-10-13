import { Module } from '@nestjs/common';
import { DashboardsModule } from './dashboards/dashboards.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    DashboardsModule,
    /* Config docs: https://docs.nestjs.com/techniques/database */
    TypeOrmModule.forRoot({ /* TODO: can we make the type configurable ? */
            type: <'sqlite'|'mariadb'>`${process.env.DB_TYPE}`,
            database: `${process.env.DB_NAME}`,
            host:`${process.env.DB_HOST}`,
            port:parseInt(`${process.env.DB_PORT}`),
            username:`${process.env.DB_USER}`,
            password:`${process.env.DB_PASS}`,
            autoLoadEntities: true, /* Entities require forFeature registration to be detected */
            synchronize:`${process.env.DB_SYNC_FLAG}`==='true', 
    }),
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { DashboardsModule } from './dashboards/dashboards.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from './model/dashboard.entity';

@Module({
  imports: [
    DashboardsModule,
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:`${process.env.ENV_LOCATION}/.env.${process.env.NODE_ENV}` 
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
          return {
              type: 'sqlite',
              database: config.get<string>('DB_NAME'),
              autoLoadEntities: true, /* Entities require forFeature registration to be detected */
              synchronize:true,                    
          }
      }
  })
  ],
})
export class AppModule {

  constructor(private config: ConfigService){
    console.log(`${process.env.ENV_LOCATION}/.env.${process.env.NODE_ENV}`);
    console.log(config.get<string>('DB_NAME'));
  }
}

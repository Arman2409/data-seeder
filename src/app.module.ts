import { Module } from '@nestjs/common';
import { CarSeederModule } from '@/modules/car-seeder/car-seeder.module';
import { ConfigModule } from '@nestjs/config';
import externalConfig from '@/config/external.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [externalConfig]
    }),
    CarSeederModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

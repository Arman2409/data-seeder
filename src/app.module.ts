import { Module } from '@nestjs/common';
import { CarSeederModule } from '@/modules/car-seeder/car-seeder.module';
import { ConfigModule } from '@nestjs/config';
import { configs } from '@/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    CarSeederModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

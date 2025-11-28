import { Module } from '@nestjs/common';
import { CarSeederModule } from './modules/car-seeder/car-seeder.module';

@Module({
  imports: [CarSeederModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

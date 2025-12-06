import { Module } from '@nestjs/common';
import { CarSeederService } from '@/modules/car-seeder/services/car-seeder.service';
import { HttpModule } from '@nestjs/axios';
import { DataTransferService } from '@/modules/car-seeder/services/data-transfer.service';

@Module({
  imports: [HttpModule.register({
    headers: {
      "x-api-key": "default-ingestion-api-key"
    }
  })],
  controllers: [],
  providers: [CarSeederService, DataTransferService],
})
export class CarSeederModule {}

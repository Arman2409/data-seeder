import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  makes,
  models,
  locations,
} from '@/constants/car-details.constants';
import { DataTransferService } from '@/modules/car-seeder/services/data-transfer.service';
import type { Car } from '@/modules/car-seeder/types/Car';

@Injectable()
export class CarSeederService implements OnModuleInit {
  private readonly logger = new Logger(CarSeederService.name);

  constructor(
    private readonly dataTransferService: DataTransferService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    // Start sending automatically when app starts
    this.startSendingCars();
  }

  private generateRandomCar(): Car {
    const make = this.randomItem(makes);
    const model = this.randomItem(models);
    const year = this.randomInt(2000, 2024);
    const price = this.randomInt(3000, 80000);
    const location = this.randomItem(locations);

    return {
      normalizedMake: make,
      normalizedModel: model,
      year,
      price,
      location,
    };
  }

  private randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  startSendingCars() {
    const intervalMs = this.configService.get<number>('carSeeder.generationIntervalMs') as number;

    setInterval(() => {
      const car: Car = this.generateRandomCar();

      // Implement data transfer handling
      this.dataTransferService
        .transferCarData(car)
        .catch((error) => {
          // Log error but don't crash - ensure continuous operation
          this.logger.error(
            `Error transferring car data: ${error.message}`,
            error.stack,
          );
        });
    }, intervalMs);
  }
}

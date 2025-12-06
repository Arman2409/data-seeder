import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import { Car } from '@/modules/car-seeder/car-seeder.interface';
import {
  makes,
  models,
  locations,
} from '@/modules/common/constants/car-details.constants';
import { DataTransferService } from '@/modules/car-seeder/services/data-transfer.service';

@Injectable()
export class CarSeederService implements OnModuleInit {
  private readonly logger = new Logger(CarSeederService.name);

  constructor(private readonly dataTransferService: DataTransferService) {}

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

  /**
   * Sends ~2000 car entities per minute.
   * 1 car every 30ms  →  60,000 / 30 ≈ 2,000
   */
  startSendingCars() {
    const intervalMs = 30;

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

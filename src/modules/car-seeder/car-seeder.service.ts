import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import { Car } from './car-seeder.interface';
import {
  makes,
  models,
  locations,
} from '../common/constants/car-details.constants';

@Injectable()
export class CarSeederService implements OnModuleInit {
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
      const car: Car | undefined = this.generateRandomCar();

      // TODO: implement data transfer handling
      Logger.log(`Sending car: ${JSON.stringify(car)}`);
    }, intervalMs);
  }
}

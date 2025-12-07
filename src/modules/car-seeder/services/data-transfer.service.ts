import { Injectable, Logger, OnModuleDestroy, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { Car } from '@/modules/car-seeder/types/Car';

@Injectable()
export class DataTransferService implements OnModuleDestroy {
  private readonly logger = new Logger(DataTransferService.name);
  private readonly receiverEndpoint: string;
  private readonly apiKey: string;
  private readonly batchSize: number;
  private readonly batchIntervalMs: number;
  
  private carBuffer: Car[] = [];
  private processedCount = 0;
  private errorCount = 0;
  private startTime = Date.now();
  private batchTimer: NodeJS.Timeout | null = null;
  private isSending = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Get configuration from the registered config
    this.receiverEndpoint = this.configService.get<string>('external.receiver_url') as string;
    this.apiKey = this.configService.get<string>('external.ingestion_api_key') as string;
    this.batchSize = this.configService.get<number>('data-processing.batch_size') as number;
    this.batchIntervalMs = this.configService.get<number>('data-processing.batch_interval_ms') as number;
    
    this.logger.log(`Receiver endpoint: ${this.receiverEndpoint}`);
    this.logger.log(`Batch size: ${this.batchSize}, Batch interval: ${this.batchIntervalMs}ms`);
    
    // Start periodic batch sending
    this.startBatchTimer();
  }

  async onModuleDestroy() {
    // Send any remaining cars when module is destroyed
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    await this.flushBatch();
  }

  /**
   * Handles the transfer of car data.
   * Adds the car to the batch buffer instead of sending immediately.
   */
  async transferCarData(car: Car): Promise<void> {
    // Add car to buffer
    this.carBuffer.push(car);
  }

  /**
   * Starts the periodic batch timer
   */
  private startBatchTimer(): void {
    this.batchTimer = setInterval(() => {
      if (this.carBuffer.length > 0 && !this.isSending) {
        this.sendBatch().catch((error) => {
          this.logger.error(`Error in batch timer: ${error.message}`);
        });
      }
    }, this.batchIntervalMs);
  }

  /**
   * Sends the current batch of cars to the receiver endpoint.
   */
  private async sendBatch(): Promise<void> {
    if (this.isSending || this.carBuffer.length === 0) {
      return;
    }

    this.isSending = true;
    let batch: Car[] = [];
    if(this.carBuffer.length <= this.batchSize) {
      batch = [...this.carBuffer];
      this.carBuffer = [];
    } else {
      batch = this.carBuffer.splice(0, this.batchSize);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.receiverEndpoint, batch, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
        }),
      );

      if(response.status === HttpStatus.ACCEPTED) {
        this.processedCount += batch.length;
        this.logger.debug(
          `Successfully sent batch of ${batch.length} cars to receiver`,
        );
        // Log statistics every 100 cars for monitoring
        if (this.processedCount % 100 === 0) {
          this.logStatistics();
        }
      } else {
        this.logger.warn(
          `Unexpected response status: ${response.status}`,
        );
      }
    } catch (error) {
      // On error, put cars back in buffer (they'll be retried)
      this.carBuffer.push(...batch);
      this.errorCount += batch.length;
      
      // Log error details for debugging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        this.logger.error(
          `Receiver responded with error: ${error.response.status} - ${JSON.stringify(error.response.data)}.`,
        );
      } else if (error.request) {
        // The request was made but no response was received
        this.logger.error(
          `No response from receiver endpoint: ${this.receiverEndpoint}.`,
        );
      } else {
        // Something happened in setting up the request
        this.logger.error(
          `Error setting up request: ${error.message}.`,
        );
      }
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Flushes any remaining cars in the buffer.
   * Called on module destroy to ensure no data is lost.
   */
  private async flushBatch(): Promise<void> {
    if (this.carBuffer.length > 0) {
      this.logger.log(`Flushing ${this.carBuffer.length} remaining cars...`);
      await this.sendBatch();
    }
  }

  /**
   * Logs statistics about processed cars
   */
  private logStatistics(): void {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    const ratePerMinute = this.processedCount / elapsedMinutes;
    
    this.logger.log(
      `Statistics: ${this.processedCount} cars processed, ` +
      `${this.errorCount} errors, ` +
      `Rate: ~${Math.round(ratePerMinute)} cars/min`,
    );
  }
}


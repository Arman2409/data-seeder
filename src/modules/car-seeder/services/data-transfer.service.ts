import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Car } from '../car-seeder.interface';

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

  constructor(private readonly httpService: HttpService) {
    // Get receiver endpoint from environment variable, default to localhost:3000
    this.receiverEndpoint =
      process.env.RECEIVER_ENDPOINT || 'http://localhost:3000/cars/bulk';
    
    // Get API key from environment variable, default to default-ingestion-api-key
    this.apiKey = process.env.API_KEY || 'default-ingestion-api-key';
    
    // Batch configuration: send every 50 cars or every 1 second, whichever comes first
    this.batchSize = parseInt(process.env.BATCH_SIZE || '50', 10);
    this.batchIntervalMs = parseInt(process.env.BATCH_INTERVAL_MS || '1000', 10);
    
    this.logger.log(`Receiver endpoint: ${this.receiverEndpoint}`);
    this.logger.log(`Batch size: ${this.batchSize}, Batch interval: ${this.batchIntervalMs}ms`);
    
    // Start periodic batch sending
    this.startBatchTimer();
  }

  onModuleDestroy() {
    // Send any remaining cars when module is destroyed
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.flushBatch();
  }

  /**
   * Handles the transfer of car data.
   * Adds the car to the batch buffer instead of sending immediately.
   */
  async transferCarData(car: Car): Promise<void> {
    // Add car to buffer
    this.carBuffer.push(car);
    
    // If buffer reaches batch size, trigger send (non-blocking)
    if (this.carBuffer.length >= this.batchSize && !this.isSending) {
      // Fire and forget - don't await to avoid blocking car generation
      this.sendBatch().catch((error) => {
        this.logger.error(`Error sending batch: ${error.message}`);
      });
    }
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
    const batch = [...this.carBuffer];
    this.carBuffer = [];

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.receiverEndpoint, batch, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
        }),
      );

      this.processedCount += batch.length;
      
      // Log statistics every 100 cars for monitoring
      if (this.processedCount % 100 === 0) {
        this.logStatistics();
      }

      // Log successful bulk transfer
      this.logger.debug(
        `Successfully sent batch of ${batch.length} cars to receiver`,
      );
    } catch (error: any) {
      // On error, put cars back in buffer (they'll be retried)
      this.carBuffer.unshift(...batch);
      this.errorCount += batch.length;
      
      // Log error details for debugging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        this.logger.error(
          `Receiver responded with error: ${error.response.status} - ${JSON.stringify(error.response.data)}. Batch of ${batch.length} cars will be retried.`,
        );
      } else if (error.request) {
        // The request was made but no response was received
        this.logger.error(
          `No response from receiver endpoint: ${this.receiverEndpoint}. Batch of ${batch.length} cars will be retried.`,
        );
      } else {
        // Something happened in setting up the request
        this.logger.error(
          `Error setting up request: ${error.message}. Batch of ${batch.length} cars will be retried.`,
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

  /**
   * Gets current statistics
   */
  getStatistics() {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    return {
      processed: this.processedCount,
      errors: this.errorCount,
      ratePerMinute: this.processedCount / elapsedMinutes,
    };
  }
}


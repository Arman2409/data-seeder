import { registerAs } from '@nestjs/config';

export default registerAs('data-processing', () => ({
  batch_size: parseInt(process.env.BATCH_SIZE || '50', 10),
  batch_interval_ms: parseInt(process.env.BATCH_INTERVAL_MS || '1000', 10),
  generation_interval_ms: parseInt(process.env.GENERATION_INTERVAL_MS || '30', 10),
}));

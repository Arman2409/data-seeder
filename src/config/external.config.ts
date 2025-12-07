import { registerAs } from '@nestjs/config';

export default registerAs('external', () => ({
  receiver_url: process.env.RECEVIER_URL || "http://localhost:3000/cars/bulk",
  ingestion_api_key: process.env.INGESTION_API_KEY || 'default-ingestion-api-key',
}));

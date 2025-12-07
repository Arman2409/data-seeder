# AMA Task -- Data Seeder (NestJS)

This NestJS project generates \~2000 car entities per minute.\
Interviewees must **fork this repository** and complete the required
implementation.

------------------------------------------------------------------------

## ⚙️ Configuration

- **Config files**: configurations are registered with NestJS and live in `src/config`:
    - `external.config.ts` (registered as `external`) — external receiver URL and ingestion key
    - `data-transfer.config.ts` (registered as `dataTransfer`) — batch size, batch interval, receiver endpoint defaults
    - `car-seeder.config.ts` (registered as `carSeeder`) — generation interval default

- **Environment variables**: copy `env.example` to `.env` and fill values. Placeholders in `env.example` show the variables you can set:
    - `RECEIVER_ENDPOINT` — URL for the receiver endpoint
    - `API_KEY` — ingestion API key
    - `BATCH_SIZE` — number of cars to collect before sending a batch
    - `BATCH_INTERVAL_MS` — maximum time (ms) between batch sends
    - `GENERATION_INTERVAL_MS` — interval (ms) between generated cars (30ms ≈ 2000 cars/min)

- **Defaults**: safe defaults are defined inside the `src/config/*.ts` files. Note that default port for this app is 3001, while for the receiver app it's 3000. Keeping defaults out of `env.example` avoids committing secrets and makes intended configuration explicit. Override any default via the `.env` file or environment.

- **Tuning**: to change the ingestion rate or batching behavior, update the `.env` values or edit the relevant file in `src/config` (for local experimentation only).

## 🧪 Running & Testing

1.  Copy `env.example` to `.env` and fill in your values.

2.  Start the app:

```bash
    yarn start:dev
```


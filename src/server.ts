import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { seedInitialUsers } from './scripts/seed.js';

dotenv.config();

const DEFAULT_PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    await seedInitialUsers();

    const app = createApp();

    const listenOnPort = (port: number) => {
      const server = app.listen(port, () => {
        console.log(`[Server] Sunrays CRM Backend running on http://localhost:${port}`);
        console.log(`[Server] API endpoints available at http://localhost:${port}/api`);
      });

      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE' && port === 5000) {
          const fallbackPort = 5001;
          console.warn(
            `\n⚠️  [Server] Port 5000 is already in use (commonly used by macOS AirPlay Receiver).`
          );
          console.log(`[Server] Automatically starting on fallback port http://localhost:${fallbackPort}...\n`);
          listenOnPort(fallbackPort);
        } else {
          console.error('[Server Error]:', error);
          process.exit(1);
        }
      });
    };

    listenOnPort(DEFAULT_PORT);
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


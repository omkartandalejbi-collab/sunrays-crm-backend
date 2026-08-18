import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { seedInitialUsers } from './scripts/seed.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    await seedInitialUsers();

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`[Server] Sunrays CRM Backend running on http://localhost:${PORT}`);
      console.log(`[Server] API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

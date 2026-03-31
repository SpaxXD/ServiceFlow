import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from './infra/database/connection';
import { createServer } from './presentation/routes';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('Database connected successfully');

    const fastify = await createServer();

    await fastify.listen({ port: PORT, host: HOST });

    console.log(`✅ Server running at http://${HOST}:${PORT}`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await disconnectDatabase();
  process.exit(0);
});

bootstrap();

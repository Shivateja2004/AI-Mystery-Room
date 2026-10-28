import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, validateEnvironment } from './config.js';
import { caseRouter } from './routes/cases.js';
import { errorHandler, notFoundHandler } from './errors.js';

validateEnvironment();
const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrls, methods: ['GET', 'POST'], optionsSuccessStatus: 204 }));
app.use(express.json({ limit: '20kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/cases', caseRouter);
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  app.listen(config.port, () => console.log(`AI Mystery Room API listening on port ${config.port}`));
}

start().catch((error) => {
  console.error('Startup failed:', error.message);
  process.exit(1);
});

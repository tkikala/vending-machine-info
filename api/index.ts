import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from '../backend/src/routes';
import uploadRouter from '../backend/src/upload-routes';
import { apiLimiter } from '../backend/src/middleware/rateLimiter';

const app = express();

app.use(cors({
  origin: true, // Allow all origins in production
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Apply rate limiting
app.use(apiLimiter);

// API routes - remove /api prefix since Vercel handles that
app.use('/', router);
app.use('/upload', uploadRouter);

export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
}; 
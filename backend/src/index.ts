import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import router from './routes';
import uploadRouter from './upload-routes';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production (Vercel handles this)
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
      ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api', router);
app.use('/api/upload', uploadRouter);

app.get('/', (req, res) => {
  res.send('Vending Machine Info API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
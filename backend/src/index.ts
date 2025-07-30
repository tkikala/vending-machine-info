import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Vending Machine Info API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
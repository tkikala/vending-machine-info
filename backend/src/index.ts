import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Vending Machine Info API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
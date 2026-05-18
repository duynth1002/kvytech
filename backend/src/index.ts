import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sellerRoutes from './routes/seller';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import { attachDemoAuth } from './middleware/auth';
import { startVerificationWorker } from './worker';

const app = express();

app.use(cors());
app.use(express.json());
app.use(attachDemoAuth);

app.use('/api/auth', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  startVerificationWorker();
});

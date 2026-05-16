import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sellerRoutes from './routes/seller';
import adminRoutes from './routes/admin';
import './worker'; // Start the background verification worker process

const app = express();

app.use(cors());
app.use(express.json());

// For mocking authentication, we'll extract a user ID from the headers
// In a real app, this would be a JWT middleware
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (userId) {
    (req as any).user = { id: userId, role: userRole || 'SELLER' };
  }
  next();
});

app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

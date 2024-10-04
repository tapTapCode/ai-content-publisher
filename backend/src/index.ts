import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contentRoutes from './routes/content';
import publishRoutes from './routes/publish';
import { startWorkers } from './jobs/queue';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/content', contentRoutes);
app.use('/api/publish', publishRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    workers: 'running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Content Publisher API',
    version: '1.0.0',
    endpoints: {
      content: '/api/content',
      publish: '/api/publish',
      health: '/health'
    }
  });
});

// Start workers
startWorkers();

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Workers started`);
});

export default app;

import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDatabase, isDatabaseConnected } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import linksRouter from './routes/links.js';
import usersRouter from './routes/users.js';
import { sendData } from './utils/apiResponse.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (req, res) => {
  return sendData(res, {
    status: isDatabaseConnected() ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/links', linksRouter);
app.use('/api', usersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// Vercel imports the app. Local development starts its own HTTP listener.
if (!process.env.VERCEL) {
  connectDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`LinkSave server running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error.message);
      process.exitCode = 1;
    });
}

export default app;

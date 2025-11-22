import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoute from './routes/auth';
import poolRoute from './routes/pool';
import driverRoute from './routes/driver';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'Working' });
});

// Routes
app.use('/auth', authRoute);
app.use('/pool', poolRoute);
app.use('/driver', driverRoute);

export default app;

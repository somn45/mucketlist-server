import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouters';
import trackRouter from './routes/trackRouters';
import cookieRouter from './routes/cookieRouters';

const app = express();
const PORT = 3001;

const corsOptions = {
  origin: true,
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/users', userRouter);
app.use('/tracks', trackRouter);
app.use('/cookies', cookieRouter);

app.listen(PORT, () => console.log(`Server connected in port ${PORT}`));

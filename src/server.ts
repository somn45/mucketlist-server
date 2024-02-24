import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouters';
import trackRouter from './routes/trackRouters';
import cookieRouter from './routes/cookieRouters';

// 내용 변경
const app = express();
const PORT = 8080;

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://mucketlist-client-4z89.vercel.app/',
    'https://mucketlist.xyz',
  ],
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

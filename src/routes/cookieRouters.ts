import express from 'express';
import { sendCookie, setCookie } from '../controllers/cookieController';

const cookieRouter = express.Router();

cookieRouter.post('/set', setCookie);
cookieRouter.get('/send', sendCookie);

export default cookieRouter;

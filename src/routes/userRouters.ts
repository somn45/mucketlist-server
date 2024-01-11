import express from 'express';
import {
  join,
  login,
  logout,
  spotifyAuth,
  refresh,
} from '../controllers/userController';
const userRouter = express.Router();

userRouter.post('/join', join);
userRouter.post('/login', login);
userRouter.post('/logout', logout);
userRouter.post('/spotify/auth', spotifyAuth);
userRouter.post('/spotify/refresh', refresh);

export default userRouter;

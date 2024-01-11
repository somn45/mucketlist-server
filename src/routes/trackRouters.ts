import express from 'express';
import {
  genres,
  search,
  addTrack,
  getTrack,
  deleteTrack,
  addTrackPlayerQueue,
  retrieveTrack,
} from '../controllers/trackController';

const trackRouter = express.Router();

trackRouter.get('/genres', genres);
trackRouter.get('/search', search);
trackRouter.post('/add', addTrack);
trackRouter.get('/read', getTrack);
trackRouter.delete('/delete', deleteTrack);
trackRouter.post('/player/add', addTrackPlayerQueue);
trackRouter.put('/recommend', retrieveTrack);

export default trackRouter;

import express from 'express';
import {
  deleteField,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import SpotifyWebApi from 'spotify-web-api-node';
import { db } from '../firebase';
import fetch from 'node-fetch';
import {
  searchTrackToArtists,
  searchTrackToGenres,
} from '../utils/addRecommendTrack';

interface addTrackControllerBody {
  track: {
    id: string;
    artistId: string;
  };
  firebaseUid: string;
}

interface addTrackPlayerQueueBody {
  uri: string;
  deviceId: string;
  accessToken: string;
}

interface CustomTrack {
  name: string;
  id: string;
  artistId: string;
  artists: string[];
  genres: string[];
  release_date: string;
  image: string;
}

export const genres = async (req: express.Request, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return;
    const accessToken = authHeader.substring(7, authHeader.length);
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);
    const response = await spotifyApi.getAvailableGenreSeeds();
    return res.status(200).json({ genres: response.body.genres });
  } catch (error) {
    console.error(error);
  }
};

export const search = async (req: express.Request, res: express.Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return;
  const accessToken = authHeader.substring(7, authHeader.length);
  const genres = req.query.genres as string;
  const parsedGenres = JSON.parse(genres);

  try {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);
    const response = await spotifyApi.getRecommendations({
      seed_genres: parsedGenres,
      limit: 100,
    });
    return res.json({
      tracks: response.body.tracks,
    });
  } catch (error) {
    console.log(error);
  }
};

export const addTrack = async (req: express.Request, res: express.Response) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);
  const accessToken = authHeader?.substring(7, authHeader.length);
  const { track, firebaseUid }: addTrackControllerBody = req.body;
  try {
    const userData = await getDoc(doc(db, 'firebaseUid', firebaseUid));
    if (!userData.exists()) return;
    let customTracks = userData.data().customTracks as CustomTrack[];
    if (!customTracks) customTracks = [];
    if (customTracks.length >= 1) {
      const dupulicateTrack = customTracks.find(
        (customTrack) => customTrack.id === track.id
      );
      if (dupulicateTrack) {
        return res.status(400).json({
          errorMsg: '이 트랙은 커스텀 트랙에 이미 등록되어 있습니다.',
        });
      }
    }

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);
    const response = await spotifyApi.getArtist(track.artistId);
    const customTrack = { ...track, genres: response.body.genres };
    await setDoc(
      doc(db, 'firebaseUid', firebaseUid),
      {
        customTracks: [...customTracks, customTrack],
      },
      { merge: true }
    );
    return res.status(200).json({ customTrack });
  } catch (error) {
    console.error(error);
  }
};

export const getTrack = async (req: express.Request, res: express.Response) => {
  try {
    const firebaseUid = req.query.firebaseUid as string;
    const userData = await getDoc(doc(db, 'firebaseUid', firebaseUid));
    if (!userData.exists()) return;
    const customTracks = userData.data().customTracks;
    return res.status(200).json({
      customTracks,
    });
  } catch (error) {
    console.error(error);
  }
};

export const deleteTrack = async (
  req: express.Request,
  res: express.Response
) => {
  const id = req.query.id as string;
  const firebaseUid = req.query.firebaseUid as string;
  const userRef = doc(db, 'firebaseUid', firebaseUid);
  const userData = await getDoc(userRef);
  if (!userData.exists()) return;
  const customTracks: CustomTrack[] = userData.data().customTracks;
  const targetData = customTracks.filter((track) => track.id !== id);
  await updateDoc(userRef, {
    customTracks: targetData,
  });
  res.sendStatus(200);
};

export const addTrackPlayerQueue = async (
  req: express.Request,
  res: express.Response
) => {
  const { uri, deviceId, accessToken }: addTrackPlayerQueueBody = req.body;
  const response = await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=${uri}&device_id=${deviceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return res.sendStatus(200);
};

export const retrieveTrack = async (
  req: express.Request,
  res: express.Response
) => {
  const artist = req.body.artist as string;
  const genres = req.body.genres as string;
  const artistOffset = req.body.artistOffset as number;
  const genresOffset = req.body.genresOfset as number;
  const accessToken = req.body.accessToken as string;
  const randomNumber = Math.floor(Math.random() * 2);
  try {
    const searchResult =
      randomNumber === 0
        ? await searchTrackToArtists(artist, artistOffset, accessToken)
        : await searchTrackToGenres(genres, genresOffset, accessToken);
    if (!searchResult) return;
    return res.status(200).json({
      track: searchResult.track,
      query: searchResult.query,
    });
  } catch (error) {
    console.error(error);
  }
};

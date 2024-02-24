import express from 'express';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import {
  deleteField,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import SpotifyWebApi from 'spotify-web-api-node';

interface UserFormBody {
  email: string;
  password: string;
}

interface RequestAccountBody {
  code?: string;
  firebaseUid: string;
  accessToken: string;
}

interface TokenData {
  refreshToken: string;
  expiredIn: number;
}

const HOUR = 1000 * 60 * 60;
const WEEK = 1000 * 60 * 60 * 24 * 7;

export const join = async (req: express.Request, res: express.Response) => {
  const { email, password }: UserFormBody = req.body;
  try {
    const response = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await setDoc(doc(db, 'firebaseUid', response.user.uid), {
      email: response.user.email,
    });
    return res.status(201).json({
      firebaseUid: response.user.uid,
    });
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/email-already-in-use') {
        return res.status(400).json({
          errorMsg: '이미 가입된 회원의 이메일입니다.',
        });
      }
    } else console.error(error);
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  const { email, password }: UserFormBody = req.body;
  try {
    const response = await signInWithEmailAndPassword(auth, email, password);
    return res.status(200).json({
      firebaseUid: response.user.uid,
    });
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        return res.status(400).json({
          errorMsg: '가입되어 있는 이메일이 아닙니다',
        });
      }
      if (error.code === 'auth/wrong-password') {
        return res.status(400).json({
          errorMsg: '이메일/비밀번호가 일치하지 않습니다.',
        });
      }
    } else console.error(error);
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  const { firebaseUid }: RequestAccountBody = req.body;
  const userRef = doc(db, 'firebaseUid', firebaseUid);
  await updateDoc(userRef, {
    refreshToken: deleteField(),
    expiredIn: deleteField(),
  });
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: HOUR,
  });
  return res.sendStatus(200);
};

export const spotifyAuth = async (
  req: express.Request,
  res: express.Response
) => {
  console.log(process.env.DOMAIN);
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.DOMAIN,
  });
  try {
    const { code, firebaseUid }: RequestAccountBody = req.body;
    if (!code) return;
    const response = await spotifyApi.authorizationCodeGrant(code);
    const now = Date.now();
    const expirationTime = now + WEEK;
    await setDoc(
      doc(db, 'firebaseUid', firebaseUid),
      {
        refreshToken: response.body.refresh_token,
        expiredIn: expirationTime,
        scope: response.body.scope,
      },
      { merge: true }
    );

    res.status(202).json({
      accessToken: response.body.access_token,
    });
  } catch (error) {
    console.log('spotify auth error', error);
  }
};

export const refresh = async (req: express.Request, res: express.Response) => {
  try {
    const firebaseUid: string = req.body.firebaseUid;
    if (!firebaseUid) return res.end();
    const userRef = doc(db, 'firebaseUid', firebaseUid);
    const userdocSnap = await getDoc(userRef);
    const userData = userdocSnap.data();
    if (!userData) return;
    const { refreshToken, expiredIn } = userData as TokenData;
    const now = Date.now();
    if (now > expiredIn) {
      await updateDoc(userRef, {
        refreshToken: deleteField(),
        expiredIn: deleteField(),
      });
      return res.status(401).json({
        errorMsg: 'token expired',
      });
    }
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      refreshToken,
    });
    const response = await spotifyApi.refreshAccessToken();
    res.cookie('accessToken', response.body.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: HOUR,
    });
    res.status(200).json({
      accessToken: response.body.access_token,
    });
  } catch (error) {
    console.log('refresh error', error);
  }
};

import express from 'express';

export const setCookie = (req: express.Request, res: express.Response) => {
  const accessToken: string = req.body.accessToken;
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 1,
  });
  res.sendStatus(200);
};
export const sendCookie = (req: express.Request, res: express.Response) => {
  res.status(200).json({
    accessToken: req.cookies.accessToken,
  });
};

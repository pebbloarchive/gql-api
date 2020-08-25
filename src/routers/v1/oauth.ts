import { Router, Response, Request } from 'express';
import { SPOTIFY_URL, SPOTIFY_REDIRECT, SPOTIFY_API } from "../../constants";
import session from '../../middleware/session';
import fetch from 'node-fetch';

const router = Router();

router.get('/spotify', async (req: Request, res: Response) => {
  let scopes = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.spotify_client +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + encodeURIComponent('http://localhost:3000/1.0/auth/spotify/callback'));
});

router.get('/spotify/callback', session, async (req, res) => {
  const body = {
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: SPOTIFY_REDIRECT,
  }

  const spotify = await fetch(SPOTIFY_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT}:${process.env.SPOTIFY_SECRET}`).toString('base64')}`
    },
    body: JSON.stringify(body as any)
  });

  const access = await fetch(SPOTIFY_API, {
    headers: {
      'Authorization': `Bearer ${spotify.access_token}`
    }
  });

  const json = await access.json();

  if (json.error) return res.status(401).send({ error: 'It seems something went wrong' });

  const spotifyData = {
    id: json.id,
    uri: json.uri
  }

  // @ts-ignore
  const connection = await db.users.findOne({ id: req.user.id }, { "connections.spotify.id": json.id });
  // @ts-ignore
  if(!connection) await db.users.updateOne({ id: req.user.id }, { $push: { connections: { spotify: spotifyData } } });

  return res.status(200).send({ data: spotifyData });
});

router.get('/authorize', async (req: Request, res: Response) => {
  const { client_id, scope, rediect_uri } = req.query;
  switch(scope) {
    case 'identify':

  }
});

export default router;

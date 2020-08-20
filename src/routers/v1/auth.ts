import { Router, Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import short from 'short-uuid';
import isAscii from 'is-ascii-control-char';
import { EMAIL_REGEX, PASSWORD_REGEX, SPOTIFY_URL, SPOTIFY_REDIRECT } from "../../constants";
import session from '../../middleware/session';
import querystring from 'querystring';
import fetch from 'node-fetch';

const centra = require('@aero/centra');
const router = Router();

const encodeFormData = (data) => {
  return Object.keys(data)
  .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
  .join('&');
}

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if(!email || !password)
      return res.status(400).send({ message: 'Missing required information' });
  try {
    // @ts-ignore
    const user = await db.users.findOne({ email: email.toLowerCase() });
    if(!user) 
      return res.status(404).send({ error: 'Unable to find that account' });
    if(user.suspended)
      return res.status(401).send({ error: 'Unable to login due to your account being disabled. Please check your email for more information.' });
    if(user) {
      if(bcrypt.compareSync(password, user.password)) {
        await jwt.sign({ id: user.id, permissions: user.permissions, exp: 900 }, process.env.jwt_secret as string,
        { algorithm: 'HS256' }, async (err, token) => {
          if(err) return res.status(400).json({ error: 'It seems something went wrong, please try again' });
          const account = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            permissions: user.permissions,
            access_token: token
          }
          // @ts-ignore
          const findToken = await db.tokens.findOne({ token });
          // @ts-ignore
          if(findToken) await db.tokens.deleteOne({ token: token });
          // @ts-ignore
          await db.tokens.insertOne({ id: user.id, token: token });
          return res.status(200).json(account);
         });
        }
    } else {
      return res.status(401).send({ error: 'Unable to login, passwords did not match' });
    }
      } catch(err) {
        return res.status(400).send({ error: 'Something went wrong'});
    }
});

router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password, invite } = req.body;

  if(!email || !password || !username)
    return res.status(400).send({ message: 'Missing required information' });

  switch(true) {
    case(!username.match(/^(.){1,26}/)): {
      return res.status(400).send({ error: 'Usernames cannot be shorter than 1 character and cannot be longer than 25 characters' });
    }
    case(isAscii(username)): {
      return res.status(400).send({ erorr: 'Your username contains unsupported characters' });
    }
    case(!email.match(EMAIL_REGEX)): {
      return res.status(400).send({ error: 'Invalid email was provided.' });
    }
    case(!password.match(PASSWORD_REGEX)): {
      return res.status(400).send({ error: 'Your password must be 8 characters or longer, and contain one uppercase character and a number' });
    }
  }

  // @ts-ignore
  const checkUsername = await db.users.findOne({ username: username });
  if(checkUsername) return res.status(400).send({ error: 'That username is already in use.' });
  // @ts-ignore
  const checkEmail = await db.users.findOne({ email: email.toLowerCase() });
  if(checkEmail) return res.status(400).send({ error: 'That email is already in use.' });

  try {
    let encryptedPass = await bcrypt.hash(password, 10);
    // const id = short.generate();
    // @ts-ignore
    const id = flake.generate(); 
    // @ts-ignore
    await db.users.insertOne({ id: id, username: username, email: email.toLowerCase(), avatar: '', password: encryptedPass,
                            email_code: '', email_verified: false, theme: 'light', suspended: false, suspended_time: null,
                            permissions: ['default'], followers: [], following: [], blocked: [], connections: {},
                            verified: false, deactivated: false, registered_at: new Date().toISOString(), mfa_enabled: false
    });
    return res.status(200).json({
      email: email.toLowerCase(),
      id: id,
      username: username,
      avatar: null,
      email_verified: false
    });
  } catch(err) {
    return res.status(400).send({ error: 'It seems something went wrong', err: err.stack });
  }
});

router.get('/spotify', async (req, res) => {
  let scopes = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.spotify_client +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + encodeURIComponent('http://localhost:3000/1.0/auth/spotify/callback'));
});

// router.get('/spotify/callback', async (req, res) => {
  // let body = {
  //   grant_type: 'authorization_code',
  //   code: req.query.code,
  //   redirect_uri: SPOTIFY_REDIRECT,
  //   client_id: process.env.spotify_client as string,
  //   client_secret: process.env.spotify_secret as string
  // }

//   await fetch(SPOTIFY_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Accept': 'application/json'
//     },
//     body: encodeFormData(body as any)
//   })
//   .then(resp => resp.json())
//   .then(data => {
//     // @ts-ignore
//     let query = querystring.stringify(data);
//     res.redirect(`http://localhost:3000/spotify/callback/${query}`);
//   });
// });

router.get('/spotify/callback', session, async (req, res) => {
  let body = {
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: SPOTIFY_REDIRECT,
    // client_id: process.env.spotify_client as string,
    // client_secret: process.env.spotify_secret as string
  }

  // const tokens = await fetch(SPOTIFY_URL, {
  //   method: 'POST',
  //   headers: {
      // 'Authorization': `Basic ${Buffer.from(`${process.env.spotify_client}:${process.env.spotify_secret}`).toString('base64')}`
  //   },
  //   body: encodeFormData(body as any)
  // });

  // let access = await fetch('https://api.spotify.com/v1/me', {
  //   headers: {
  //     'Authorization': `Bearer ${tokens.access_token}`
  //   }
  // });

  const tokens = await centra(SPOTIFY_URL, 'POST')
    .body(body, 'form')
    .header('Authorization', `Basic ${Buffer.from(`${process.env.spotify_client}:${process.env.spotify_secret}`).toString('base64')}`)
    .json();

  const access = await centra('https://api.spotify.com/v1/me')
  .header('Authorization', `Bearer ${tokens.access_token}`)
  .json();

  if (access.error) return res.status(401).send({ error: 'It seems something went wrong' });

  const spotifyData = {
    id: access.id,
    uri: access.uri
  }

  // @ts-ignore
  const connection = await db.users.findOne({ id: req.user.id }, { "connections.spotify.id": access.id });
  // @ts-ignore
  if(!connection) await db.users.updateOne({ id: req.user.id }, { $push: { connections: { spotify: spotifyData } } });

  return res.status(200).send({ data: spotifyData });
});

// removed email verification for now for testing purposes
router.post('/verify', async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if(!code || !email) return res.status(400).send({ error: 'Missing required information.' });

  // @ts-ignore
  const data = await db.users.findOne({ email: email });
  if(!data) return res.status(400).send({ error: 'Unable to find that user.' });
  if(code != data.email_code) return res.status(400).send({ error: 'Invalid verification code was provided.' });

  if(data) {
    // @ts-ignore
    await db.users.updateOne({ email: email }, { $set : { email_verified: true } });
    return res.status(200).send({ email: email, email_code: code });
  }
});

router.post('/refresh', session, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    await jwt.sign({ id: req.user.id, email: req.user.email, permissions: req.user.permissons, exp: 604800 }, process.env.jwt_secret as string, { algorithm: 'HS256' }, async (err, token) => {
      if(err) return res.status(400).json({ err: 'It seems something went wrong, please try again' });
      // @ts-ignore
      await db.tokens.insertOne({ id: req.user.id, refresh_token: token });
      return res.status(200).send({
        access_token: '',
        refresh_token: token
      });
    });
  } catch(err) {
    return res.status(400).json({ error: 'Something went wrong' });
  }
});

router.post('/logout', session, async (req: Request, res: Response) => {
  const { token, refresh_token } = req.body;
  if(!token || !refresh_token) return res.status(401).send({ error: 'Missing tokens' });
  try {
    // @ts-ignore
    const findToken = await db.tokens.findOne({ token: token });
    if(!findToken) return res.status(404).send();
      // @ts-ignore
    const findRefreshToken = await db.tokens.findOne({ refresh_token: refresh_token });
    if(!findRefreshToken) return res.status(404).send();
    // @ts-ignore
    await db.tokens.deleteOne({ refresh_token: refresh_token });
    // @ts-ignore
    await db.tokens.deleteOne({ token: token });
    return res.status(200).send({ access_token: '', refresh_token: '' });
  } catch(err) {
    return res.status(400).json({ error: 'Something went wrong' });
  }
});

export default router;

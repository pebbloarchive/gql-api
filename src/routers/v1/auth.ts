import { Router, Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import short from 'short-uuid';
import isAscii from 'is-ascii-control-char';
import { EMAIL_REGEX, PASSWORD_REGEX, SPOTIFY_URL, SPOTIFY_REDIRECT, SPOTIFY_API, RANDOM_STRING, WEAK_PASSWORD, EMAIL_TAKEN, USERNAME_TAKEN, INVALID_EMAIL, UNSUPPORTED_USERNAME, INVALID_USERNAME, INVALID_INFO, INVALID_PASSWORD, INVALID_CONF_PASSWORD, COMMON_ERROR, genToken, SAME_PASSWORD_AS_BEFORE } from "../../constants";
import session from '../../middleware/session';
import querystring from 'querystring';
import { getRedisClient } from '../../redis';

const zxcvbn = require('zxcvbn');
const router = Router();

const encodeFormData = (data) => {
  return Object.keys(data)
  .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
  .join('&');
}

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if(!email || !password) return res.status(400).send({ error: INVALID_INFO });

  // @ts-ignore
  const user = await db.users.findOne({ email: email.toLowerCase() });
  if(!user) return res.status(404).send({ error: INVALID_EMAIL });

  const checkPassword = bcrypt.compareSync(password, user.password);
  if(!checkPassword) res.status(401).send({ error: INVALID_CONF_PASSWORD });

  try {
    // @ts-ignore
    jwt.sign({ id: user.id, session: flake.generate(), exp: 900 }, process.env.JWT_SECRET as string, { algorithm: 'HS256' }, (err, token) => {
      if(err) return res.status(400).send({ error: COMMON_ERROR });
        const account = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        permissions: user.permissions,
        created_at: user.registered_at,
        connections: user.connections
      }
      // getRedisClient().set(`tokens:${user.id}`, token);
      return res.status(200).json({ data: { access_token: token, refresh_token: genToken(30), account: account } });
    });
  } catch(err) {
    return res.status(400).send({ error: COMMON_ERROR });
  }
});


router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password, invite } = req.body;

  if(!email || !password || !username)
    return res.status(400).send({ message: INVALID_INFO });

  switch(true) {
    case(!username.match(/^(.){3,26}/)): {
      return res.status(400).send({ error: INVALID_USERNAME });
    }
    case(isAscii(username)): {
      return res.status(400).send({ erorr: UNSUPPORTED_USERNAME });
    }
    case(!email.match(EMAIL_REGEX)): {
      return res.status(400).send({ error: INVALID_EMAIL });
    }
  }

  const { score } = zxcvbn(password);

  if(score < 3) return res.status(400).send({ error: WEAK_PASSWORD });

  // @ts-ignore
  const checkUsername = await db.users.findOne({ username: username });
  if(checkUsername) return res.status(400).send({ error: USERNAME_TAKEN });
  // @ts-ignore
  const checkEmail = await db.users.findOne({ email: email.toLowerCase() });
  if(checkEmail) return res.status(400).send({ error: EMAIL_TAKEN });

  try {
    let encryptedPass = await bcrypt.hash(password, 10);
    // const id = short.generate();
    // @ts-ignore
    const id = flake.generate();
    // @ts-ignore
    await db.users.insertOne({ id: id, username: username, name: username, description: 'Descriptions are cool, right?', email: email.toLowerCase(), avatar: 'https://cdn.discordapp.com/attachments/596156721928470547/746173257866018866/unknown.png', password: encryptedPass,
                            email_code: '', email_verified: false, suspended: false, suspended_time: null,
                            permissions: ['default', 'beta'], followers: [], following: [], blocked: [], connections: {},
                            settings: { theme: "dark", rainbow: false, privacy: {} },
                            deactivated: false, created_at: new Date().toISOString(), mfa_enabled: false
    });
    return res.status(200).json({
      email: email.toLowerCase(),
      id: id,
      username: username,
      email_verified: false
    });
  } catch(err) {
    return res.status(400).send({ error: COMMON_ERROR });
  }
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

router.post('/update/password', session, async (req: Request, res: Response) => {
  const { password, confirm_password, new_password } = req.body;
  if(!password || !confirm_password || !new_password) {
    return res.status(401).send({ error: 'missing_content' });
  }

  // @ts-ignore
  const user = await db.users.findOne({ id: req.user.id });

  const { score } = zxcvbn(new_password);

  if(score < 3) return res.status(400).send({ error: WEAK_PASSWORD });

  const encryptedPass = await bcrypt.hash(new_password, 10);

  const checkPassword = bcrypt.compareSync(password, user.password);

  if(!checkPassword || (confirm_password !== new_password)) return res.status(401).send({ error: INVALID_CONF_PASSWORD });

  if(new_password === password) return res.status(401).send({ error: SAME_PASSWORD_AS_BEFORE });

  try {
    // @ts-ignore
    await db.users.updateOne({ id: req.user.id }, { $set: { password: encryptedPass } });
    // @ts-ignore
    let token = await jwt.sign({ id: req.user.id, session: flake.generate(), exp: 900 }, process.env.JWT_SECRET as string, { algorithm: 'HS256' });
    return res.status(200).send({ message: 'password_success', token: token });
  } catch(err) {
      return res.status(400).send({ error: COMMON_ERROR });
  }
});

// router.post('/refresh', session, async (req: Request, res: Response) => {
//   try {
//     // @ts-ignore
//     await jwt.sign({ id: req.user.id, iat: 604800 }, process.env.JWT_SECRET as string, { algorithm: 'HS256' }, async (err, token) => {
//       if(err) return res.status(400).json({ err: 'It seems something went wrong, please try again' });
//       // @ts-ignore
//       await db.tokens.insertOne({ id: req.user.id, refresh_token: token });
//       return res.status(200).send({
//         access_token: '',
//         refresh_token: token
//       });
//     });
//   } catch(err) {
//     return res.status(400).json({ error: 'Something went wrong' });
//   }
// });

// router.post('/logout', session, async (req: Request, res: Response) => {
//   const { token, refresh_token } = req.body;
//   if(!token || !refresh_token) return res.status(401).send({ error: 'Missing tokens' });
//   try {
//     // @ts-ignore
//     const findToken = await db.tokens.findOne({ token: token });
//     if(!findToken) return res.status(404).send();
//       // @ts-ignore
//     const findRefreshToken = await db.tokens.findOne({ refresh_token: refresh_token });
//     if(!findRefreshToken) return res.status(404).send();
//     // @ts-ignore
//     await db.tokens.deleteOne({ refresh_token: refresh_token });
//     // @ts-ignore
//     await db.tokens.deleteOne({ token: token });
//     return res.status(200).send({ access_token: '', refresh_token: '' });
//   } catch(err) {
//     return res.status(400).json({ error: 'Something went wrong' });
//   }
// });

export default router;

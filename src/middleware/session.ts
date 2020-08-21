import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

export default async function session(req: Request, res: Response, next: NextFunction) {
  let token;
  if(!req.headers['authorization']) {
    return res.status(401).send({ error: 'Invalid authorization data was given.' });
  }
  if(!req.headers['authorization'].startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Invalid authorization data was given.' });
  }
  if(req.headers['authorization'].includes('Bearer ')) {
    token = req.headers['authorization'].split('Bearer ')[1];
  }
  await jwt.verify(token, process.env.jwt_secret as string, async (err, data) => {
    // @ts-ignore
    const finduser = await db.users.findOne({ id: data.id });
    if(!finduser) return res.status(401).send({ error: 'Something went wrong when trying to authorize.' });
    if(err) return res.status(401).send({ error: 'Invalid authorization data was given.' });
    const { iat } = await jwt.decode(token);
    if(iat < (new Date().getTime() + 1) / 1000) return res.status(401).send({ error: 'Expired authorization token was passed' });
    // @ts-ignore
    req.user = data as any;
    next();
  });
};

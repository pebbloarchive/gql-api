import { Router, Response, Request, NextFunction } from 'express';
import session from '../../middleware/session';
import jimp from 'jimp';
import { MinioClient } from '../../minio';
import fs from 'fs';
import path from 'path';

const router = Router();

const ALLOWED_EXT = ['png', 'jpeg', 'jpg'];
const ALLOWED_IMG = ['image/png', 'image/jpg', 'image/jpeg'];
const MAX_SIZE = 10000000;

const dir = `${__dirname}/../tmp`;

router.delete('/deactivate', session, async (req: Request, res: Response, next: NextFunction) => {

});

router.post('/update/avatar', session, async (req, res) => {
  // @ts-ignore
  // if(req.files) {
    // @ts-ignore
    // let file = req.files;
    // if(!file) return res.status(400).send({ error: 'No file was attached.' });

    // let ext = file.name.split('.').pop();
    // if(ext !== ALLOWED_EXT || file.mimetype !== ALLOWED_IMG) return res.status(400).send({ error: 'Invalid file type' });

    // if(file.size > MAX_SIZE) return res.status(400).send({ error: 'Avatar exceeds max file size. Please upload an image lower than 10mb' });

    // jimp.read(file).then(img => {
    //   img.resize(256, 256)
    //   .quality(60)
    //   .greyscale()
    //   .writeAsync(file);
    //   // @ts-ignore
    //   MinioClient.fPutObject('avatars', `${req.user.id}.${file.mimetype}`, 'na-east1', {});
    // });
    // // @ts-ignore
    // await db.users.updateOne({ id: req.user.id }, { $set: { avatar: `http://localhost:9000/avatars/${req.user.id}.${file.memetype}` } });
    // // @ts-ignore
    // const user = await db.users.findOne({ id: req.user.id });
    // return res.status(200).send({
    //   avatar: user.avatar
    // });
  // } else {
    // return res.status(400).send({ error: 'No file was provided.' });
  // }

  const dir = `${__dirname}/../tmp`;
  const url = 'http://localhost:9000/avatars/';
  const stream = MinioClient.getObject('avatars', url);
  const filePath = path.join(`${dir}/${url}`)
  // @ts-ignore
  req.pipe(req.busyboy);
  // @ts-ignore
  req.busyboy.on('file', (fieldname, file, filename) => {
    stream.pipe()
  });

});


export default router;

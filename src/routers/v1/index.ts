import { Router } from 'express';

const router = Router();

import authRouter from './auth';
import userRouter from './users';

router.use('/auth', authRouter);
router.use('/users', userRouter);

router.get('/health', (req, res) => {
   return res.send({ ok: true });
})

export default router;

import { Router } from 'express';

const router = Router();

import authRouter from './auth';
import oauthRouter from './oauth';
import userRouter from './users';
import adminRouter from './admin';
import accountRouter from './account';

router.use('/auth', authRouter);
router.use('/oauth', oauthRouter);
router.use('/users', userRouter);
router.use('/admin', adminRouter);
router.use('/account', accountRouter);

router.get('/health', (req, res) => {
   return res.send({ ok: true });
})

export default router;

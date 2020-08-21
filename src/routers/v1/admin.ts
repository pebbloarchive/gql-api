import { Router, Response, Request, NextFunction } from 'express';
import session from '../../middleware/session';
import { MessageChannel } from 'worker_threads';

const router = Router();

router.post('/ban/:id', session, async (req: Request, res: Response, next: NextFunction) => {
  const { time } = req.body;
  // @ts-ignore
  const me = await db.users.findOne({ id: req.user.id });
  // @ts-ignore
  if(!me.permissions.includes(/(admin|developer|staff)/))
    return res.status(401).send({ error: 'Unable to use this endpoint due to missing permissions' }); 

  try {
    // @ts-ignore
    const user = await db.users.findOne({ id: req.params.id });
    if(!user) return res.status(404).send({ error: 'Unable to find that user' });
    // @ts-ignore
    await db.users.updateOne({ id: req.params.id }, { suspended: true });
  } catch(err) {
    return res.send(400).send({ error: 'It seems something went wrong' });
  }
});

export default router;

import { Router, Response, Request, NextFunction } from 'express';
import session from '../../middleware/session';

const router = Router();

router.post('/ban/:id', session, async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if(!req.user.permissions.includes(/(admin|developer|staff)/))
    return res.status(401).send({ erorr: 'Unable to use this endpoint due to missing permissions' }); 
});

export default router;

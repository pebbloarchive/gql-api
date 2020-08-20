import { Router, Response, Request, NextFunction } from 'express';
import session from '../../middleware/session';

const router = Router();

router.delete('/deactivate', session, async (req: Request, res: Response, next: NextFunction) => {

});

export default router;

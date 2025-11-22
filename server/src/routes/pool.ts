import express from 'express';
import { body } from 'express-validator';
import PoolController from '../controllers/Pool';
import fetchuser from '../middlewares/fetchuser';

const router = express.Router();

router.post(
  '/new',
  [
    body('trainNo', 'Train number should be valid').isLength({
      min: 5,
      max: 5,
    }),
    body('journeyDate', 'Password should not be empty').notEmpty(),
  ],
  fetchuser as express.RequestHandler,
  PoolController.new as unknown as express.RequestHandler,
);

router.get(
  '/search',
  fetchuser as express.RequestHandler,
  PoolController.search as unknown as express.RequestHandler,
);

router.get(
  '/myupcoming',
  fetchuser as express.RequestHandler,
  PoolController.myUpcoming as unknown as express.RequestHandler,
);

router.get(
  '/:poolId',
  fetchuser as express.RequestHandler,
  PoolController.poolDetails as unknown as express.RequestHandler,
);

router.post(
  '/:poolId/toggle-lock',
  fetchuser as express.RequestHandler,
  PoolController.toggleLock as unknown as express.RequestHandler,
);

router.post(
  '/:poolId/join',
  fetchuser as express.RequestHandler,
  PoolController.join as unknown as express.RequestHandler,
);

router.post(
  '/:poolId/leave',
  fetchuser as express.RequestHandler,
  PoolController.leave as unknown as express.RequestHandler,
);

export default router;

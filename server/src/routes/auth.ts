import express from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/Auth';
import fetchuser from '../middlewares/fetchuser';

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Your name should be at least 4 characters').isLength({
      min: 4,
    }),
    body('email', 'Please include a valid email').isEmail(),
    body('phone', 'Please include a valid email').isMobilePhone('en-IN'),
    body('password', 'Password must be at least 6 characters').isLength({
      min: 6,
    }),
    body('rollNo', 'Roll Number should be 9 characters long').isLength({
      min: 9,
      max: 9,
    }),
    body('gender', 'Please enter your gender').notEmpty(),
  ],
  AuthController.register,
);

router.post(
  '/login',
  [
    body('rollNo', 'Roll Number should be 9 characters long').isLength({
      min: 9,
      max: 9,
    }),
    body('password', 'Password should not be empty').notEmpty(),
  ],
  AuthController.login,
);

router.get(
  '/me',
  fetchuser as express.RequestHandler,
  AuthController.me as unknown as express.RequestHandler,
);

router.post('/forgot-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

export default router;

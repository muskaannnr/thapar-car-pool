import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'randomstringhere';

interface NewRequest extends Request {
  user: JSON;
}

const fetchuser = (req: NewRequest, res: Response, next: NextFunction) => {
  const token = req.header('auth-token');
  if (!token) {
    return res
      .status(401)
      .send({ error: 'Please Authenticate using a valid token' });
  }
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    req.user = payload.user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

export default fetchuser;

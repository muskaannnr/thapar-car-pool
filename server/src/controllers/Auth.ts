import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/mailer';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

interface AuthBody {
  name: string;
  email: string;
  phone: number;
  rollNo: number;
  password: string;
  gender: string;
}

const AuthController = {
  register: async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, phone, rollNo, password, gender }: AuthBody =
        req.body;

      const existingUser = await User.find({ email, phone, rollNo });
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      // If the user doesn't exist, create a new user
      const newUser = await User.create({
        name,
        email,
        phone,
        rollNo,
        password: hash,
        gender,
      });

      let payload = {
        user: {
          id: newUser._id,
        },
      };

      const authtoken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'randomstringhere',
      );

      return res.status(200).json({ success: true, authtoken });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error!' });
    }
  },

  login: async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { rollNo, password }: AuthBody = req.body;

      const theUser = await User.findOne({ rollNo });
      if (!theUser) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const checkHash = await bcrypt.compare(password, theUser.password);
      if (!checkHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: theUser._id,
        },
      };

      const authtoken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'randomstringhere',
      );

      return res.status(200).json({ success: true, authtoken });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error!' });
    }
  },

  me: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const me = await User.findById(req.user.id).select('-password');

      return res.status(200).json({ user: me });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error!' });
    }
  },

  requestPasswordReset: async (req: Request, res: Response): Promise<any> => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = Date.now() + 3600000; // 1 hour validity

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(resetTokenExpires);
      await user.save();

      // Simulate sending email (replace with actual email sending logic)
      // Password reset link
      const resetLink = `https://thaparpool.rebec.in/reset-password?token=${resetToken}`;

      // Send email
      const emailContent = `
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

      await sendEmail(user.email, 'Password Reset Request', emailContent);

      return res
        .status(200)
        .json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  resetPassword: async (req: Request, res: Response): Promise<any> => {
    try {
      const { token, newPassword } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
      }

      // Update the user's password and clear reset fields

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      user.password = hash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return res
        .status(200)
        .json({ message: 'Password has been reset successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },
};

export default AuthController;

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: '"ThaparCarPool"  abhinandanwadhwa8@gmail.com',
      to,
      subject,
      html,
    });

    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send email.');
  }
};

export default sendEmail;

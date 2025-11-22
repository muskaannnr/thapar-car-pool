import express from 'express';
import DriverController from '../controllers/Driver';

const router = express.Router();

router.post('/create', DriverController.create);

export default router;

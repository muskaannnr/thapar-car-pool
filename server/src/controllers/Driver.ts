import { Request, Response } from 'express';
import Driver from '../models/Driver';

const DriverController = {
  list: async (_req: Request, res: Response) => {
    try {
      const drivers = await Driver.find();
      return res.status(200).json({ drivers });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { name, phone } = req.body;
      const newDriver = await Driver.create({ name, phone });
      return res
        .status(201)
        .json({ message: 'Driver added successfully.', driver: newDriver });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { driverId } = req.params;
      const { isAvailable } = req.body;

      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({ error: 'Driver not found.' });
      }

      driver.isAvailable = isAvailable;
      await driver.save();

      return res
        .status(200)
        .json({ message: 'Driver status updated successfully.', driver });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
};

export default DriverController;

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Pool from '../models/Pool';
import fs from 'fs';
import path from 'path';
import Driver from '../models/Driver';
import fetch from 'node-fetch';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

interface PoolData {
  trainNo: number;
  journeyDate: Date;
}

interface TrainData {
  TrainNo: string;
  TrainName: string;
  Source: string;
  ArrivalTime: string;
  Destination: string;
  DepartureTime: string;
}

const PoolController = {
  new: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { trainNo, journeyDate }: PoolData = req.body;

      // Read the train data from the JSON file
      const trainDataPath = path.resolve(__dirname, '../data/ambala.json');
      const trainData: TrainData[] = JSON.parse(
        fs.readFileSync(trainDataPath, 'utf-8'),
      );

      // Find the train with the given train number
      const selectedTrain = trainData.find(
        (train) => train.TrainNo === trainNo.toString(),
      );

      if (!selectedTrain) {
        return res
          .status(404)
          .json({ error: 'This train does not arrive at Ambala.' });
      }

      // Combine journey date and arrival time to form a datetime
      const arrivalDateTime = new Date(journeyDate);
      const [hours, minutes, seconds] =
        selectedTrain.ArrivalTime.split(':').map(Number);
      arrivalDateTime.setHours(hours, minutes, seconds);

      const theUser = await User.findById(req.user.id);
      if (!theUser) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Find an available driver
      const availableDriver = await Driver.findOne({ isAvailable: true });
      if (!availableDriver) {
        return res.status(404).json({ error: 'No drivers available.' });
      }

      // Create the pool
      const newPool = await Pool.create({
        owner: req.user.id,
        trainNo,
        journeyDate: arrivalDateTime,
        members: [
          {
            id: req.user.id,
            name: theUser.name,
            arrivalTime: arrivalDateTime,
          },
        ],
        originalArrivalTime: arrivalDateTime,
        driver: {
          id: availableDriver._id,
          name: availableDriver.name,
          phone: availableDriver.phone,
        },
      });

      // Mark driver as unavailable
      availableDriver.isAvailable = false;
      await availableDriver.save();

      const istDate = arrivalDateTime.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
      });

      const istTime = arrivalDateTime.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      // Send whatsapp notification to driver on his phone (using baileys because it's cool)
      const response = await fetch(
        'https://api.whatsapp.abhinandan.me/whatsapp/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${process.env.BAILEYS_AUTH_KEY}`,
          },
          body: JSON.stringify({
            number: `91${availableDriver.phone}`,
            message: `*New Pool Assignment* 🚗

Hello ${availableDriver.name},

You've been assigned to a new pool! 🎉

Details:

Journey Date: *${istDate} - ${istTime}*
Pickup Location: *Ambala Cantt Railway Station*
Drop Location: *Thapar University, Patiala*
Contact Person: *${theUser.name}* (${theUser.phone})

Please be on time and ensure the passengers have a smooth and safe journey.

Thank you for your service!

Regards,
ThaparCarPool`,
          }),
        },
      );
      const json = await response.json();
      console.log(json);

      return res
        .status(201)
        .json({ message: 'Pool created successfully!', pool: newPool });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error!' });
    }
  },

  search: async (req: Request, res: Response): Promise<any> => {
    try {
      const trainNo = req.query.trainno;
      const journeyDate = req.query.journeyDate;

      if (!trainNo || !journeyDate) {
        return res
          .status(400)
          .json({ error: 'Train number and journey date are required.' });
      }

      const journeyDateOnly = new Date(journeyDate as string);
      if (isNaN(journeyDateOnly.getTime())) {
        return res.status(400).json({ error: 'Invalid journey date format.' });
      }

      const trainDataPath = path.resolve(__dirname, '../data/ambala.json');
      const trainData: TrainData[] = JSON.parse(
        fs.readFileSync(trainDataPath, 'utf-8'),
      );

      const selectedTrain = trainData.find(
        (train) => train.TrainNo === trainNo.toString(),
      );
      if (!selectedTrain) {
        return res
          .status(404)
          .json({ error: 'Train number not found in Ambala data.' });
      }

      const [hours, minutes, seconds] =
        selectedTrain.ArrivalTime.split(':').map(Number);
      const journeyDateTime = new Date(journeyDateOnly);
      journeyDateTime.setHours(hours, minutes, seconds);

      const maxLateTime = new Date(journeyDateTime);
      maxLateTime.setMinutes(maxLateTime.getMinutes() + 30);

      const maxEarlyTime = new Date(journeyDateTime);
      maxEarlyTime.setMinutes(maxEarlyTime.getMinutes() - 30);

      // Exclude locked pools in the search
      const pools = await Pool.find({
        locked: false,
        originalArrivalTime: {
          $gte: maxEarlyTime,
          $lte: maxLateTime,
        },
      });

      if (pools.length === 0) {
        return res.status(404).json({
          message:
            'No unlocked pools found for the specified train number and journey date.',
        });
      }

      return res.status(200).json({ message: 'Pools found.', pools });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  myUpcoming: async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> => {
    try {
      const userId = req.user.id;

      // Get the current date and time
      const currentDateTime = new Date();

      // Fetch upcoming pools where the user is a member
      const upcomingPools = await Pool.find({
        'members.id': userId, // Check if the user is in the members array
        journeyDate: { $gte: currentDateTime }, // Only future pools
      }).sort({ journeyDate: 1 }); // Sort by closest journey date

      if (upcomingPools.length === 0) {
        return res.status(404).json({ message: 'No upcoming pools found.' });
      }

      return res.status(200).json({
        message: 'Upcoming pools retrieved successfully.',
        pools: upcomingPools,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  poolDetails: async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> => {
    try {
      const { poolId } = req.params;

      // Validate poolId
      if (!poolId) {
        return res.status(400).json({ error: 'Pool ID is required.' });
      }

      // Fetch the pool by ID
      const pool = await Pool.findById(poolId);
      if (!pool) {
        return res.status(404).json({ error: 'Pool not found.' });
      }

      // Fetch details of all members in the pool
      const memberIds = pool.members.map((member) => member.id);
      const members = await User.find({ _id: { $in: memberIds } }).select(
        'name email phone gender',
      );

      return res.status(200).json({
        message: 'Pool details retrieved successfully.',
        pool,
        members,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  toggleLock: async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<any> => {
    try {
      const { poolId } = req.params;

      // Validate poolId
      if (!poolId) {
        return res.status(400).json({ error: 'Pool ID is required.' });
      }

      // Fetch the pool and check ownership
      const pool = await Pool.findById(poolId);
      if (!pool) {
        return res.status(404).json({ error: 'Pool not found.' });
      }
      if (pool.owner?.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'Only the owner can toggle the lock for this pool.' });
      }

      // Toggle the lock status
      pool.locked = !pool.locked;
      await pool.save();

      const status = pool.locked ? 'locked' : 'unlocked';
      return res.status(200).json({
        message: `Pool successfully ${status}.`,
        pool,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  join: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { poolId } = req.params;

      // Fetch the pool by ID
      const pool = await Pool.findById(poolId);
      if (!pool) {
        return res.status(404).json({ error: 'Pool not found.' });
      }

      // Check if the pool is locked
      if (pool.locked) {
        return res.status(403).json({ error: 'This pool is locked.' });
      }

      // Check if the user is already a member
      const isAlreadyMember = pool.members.some(
        (member) => member.id === req.user.id,
      );
      if (isAlreadyMember) {
        return res
          .status(400)
          .json({ error: 'You are already a member of this pool.' });
      }

      // Fetch the user details
      const theUser = await User.findById(req.user.id);
      if (!theUser) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Add the user to the pool's members
      pool.members.push({
        id: req.user.id,
        name: theUser.name,
        arrivalTime: pool.originalArrivalTime,
      });

      await pool.save();

      return res
        .status(200)
        .json({ message: 'Joined the pool successfully!', pool });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },

  leave: async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const { poolId } = req.params;

      // Fetch the pool by ID
      const pool = await Pool.findById(poolId);
      if (!pool) {
        return res.status(404).json({ error: 'Pool not found.' });
      }

      // Check if the user is a member of the pool
      const memberIndex = pool.members.findIndex(
        (member) => member.id.toString() === req.user.id,
      );
      if (memberIndex === -1) {
        return res
          .status(400)
          .json({ error: 'You are not a member of this pool.' });
      }

      // Remove the user from the pool's members
      pool.members.splice(memberIndex, 1);

      // Handle if the user is the owner
      if (pool.owner?.toString() === req.user.id) {
        if (pool.members.length > 0) {
          // Promote the next member in the list to owner
          pool.owner = pool.members[0].id;
        } else {
          // No more members, dissolve the pool
          await Pool.findByIdAndDelete(poolId);

          // Free the driver
          const driver = await Driver.findById(pool.driver?.id);
          if (driver) {
            driver.isAvailable = true;
            await driver.save();
          }

          return res
            .status(200)
            .json({ message: 'You left and the pool has been dissolved.' });
        }
      }

      await pool.save();

      return res
        .status(200)
        .json({ message: 'Left the pool successfully!', pool });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  },
};

export default PoolController;

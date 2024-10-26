import express from 'express';
import { redisClient } from '../config/redis.js'; // Assuming Redis connection is in redis.js
import connection from '../config/db.js'; // Assuming MySQL connection is in db.js
import router from './cabs.js';

// Fetch ongoing trips for a specific user from Redis
router.get('/ongoingTrips/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const keys = await redisClient.keys('trip:*'); // Get all trip keys

        const ongoingTrips = await Promise.all(keys.map(async (key) => {
            const tripData = await redisClient.hGetAll(key);
            return tripData.userId === userId ? tripData : null; // Filter by userId
        }));

        const filteredOngoingTrips = ongoingTrips.filter(trip => trip !== null);

        if (filteredOngoingTrips.length === 0) {
            return res.status(404).json({ message: 'No ongoing trips found' });
        }

        res.status(200).json(filteredOngoingTrips);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching ongoing trips from Redis' });
    }
});

// Fetch past trips for a specific user from MySQL
router.get('/pastTrips/:userId', (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT * FROM trips WHERE user_id = ? AND status IN ("completed", "cancelled")';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching trips data' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No past trips found' });
        }
        res.status(200).json(results);
    });
});

export default router;

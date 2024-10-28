import express from 'express';
import { redisClient } from '../config/redis.js'; 
import connection from '../config/db.js'; 

const router = express.Router();

// Route to fetch cab data from Redis
router.get('/redis', async (req, res) => {
    try {
        const cabKeys = await redisClient.keys('cab:*');
        const cabs = await Promise.all(
            cabKeys.map(async (key) => {
                const cabData = await redisClient.hGetAll(key);
                return {
                    id: key.split(':')[1],
                    latitude: parseFloat(cabData.latitude),
                    longitude: parseFloat(cabData.longitude),
                    status: cabData.status,
                };
            })
        );
        res.json(cabs);
    } catch (err) {
        console.error('Error fetching cab data from Redis:', err);
        res.status(500).send('Error fetching cab data from Redis');
    }
});

// Route to fetch initial cab details from MySQL database
router.get('/mysql', async (req, res) => {
    try {
        const query = 'SELECT cabId AS id, driver_name, car_type, latitude, longitude, status FROM cabs;';
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching cab details from MySQL:', err);
                return res.status(500).json({ error: 'Failed to fetch cab details from MySQL' });
            }
            res.json(results);
        });
    } catch (err) {
        console.error('Error fetching initial cab details from MySQL:', err);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// Route to fetch details based on id
router.get('/mysql/:id', async (req, res) => {
    try {
        const query = 'SELECT * FROM cabs WHERE cabId = ?';
        connection.query(query, [req.params.id], (err, results) => {
            if (err) {
                console.error('Error fetching cab details from MySQL:', err);
                return res.status(500).json({ error: 'Failed to fetch cab details from MySQL' });
            }
            res.json(results.length > 0 ? results : { error: 'Cab not found' });
        });
    } catch (err) {
        console.error('Error fetching cab details from MySQL:', err);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// Route to post data into Redis
router.post('/redis', async (req, res) => {
    const { id, latitude, longitude, status } = req.body; // Extract data from request body
    if (!id || latitude === undefined || longitude === undefined || status === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const cabKey = `cab:${id}`;
        await redisClient.hSet(cabKey, {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            status: status, 
        });
        res.status(201).json({ message: 'Cab data added to Redis' });
    } catch (err) {
        console.error('Error posting cab data to Redis:', err);
        res.status(500).json({ error: 'Failed to post cab data to Redis' });
    }
});

// Post for MySQL
router.post('/mysql', (req, res) => {
    const { driver_name, car_type, latitude, longitude, rating, status } = req.body; // Include status in the request body
    if (!driver_name || !car_type || latitude === undefined || longitude === undefined || rating === undefined || status === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO cabs (driver_name, car_type, latitude, longitude, rating, status) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [driver_name, car_type, latitude, longitude, rating, status], (err, results) => {
        if (err) {
            console.error('Error posting cab data to MySQL:', err);
            return res.status(500).json({ error: 'Failed to post cab data to MySQL' });
        }

        // Respond with the new cabId that was auto-incremented
        const newCabId = results.insertId; // This gives the auto-incremented ID
        res.status(201).json({ message: 'Cab data added to MySQL', cabId: newCabId });
    });
});

export default router;

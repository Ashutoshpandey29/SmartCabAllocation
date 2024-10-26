import express from "express";
import { redisClient } from "../config/redis.js"; 
import connection from "../config/db.js"; 

const router = express.Router();

// POST endpoint to book a cab
router.post('/bookCab/:cabId', async (req, res) => {
    const { cabId } = req.params;
    const { userId, source, destination } = req.body;

    // Check if parameters are present
    if (!cabId || !userId || !source || !destination) {
        return res.status(400).json({ message: 'Missing required details: cabId, userId, source, and destination are required.' });
    }

    try {
        // Fetch cab status from Redis hash
        const cabData = await redisClient.hGetAll(`cab:${cabId}`);
        
        // Check if cabData exists
        if (!cabData || cabData.status === 'booked') {
            return res.status(409).json({ message: 'Cab is already booked.' });
        }

        // Mark cab as 'booked' in Redis hash
        await redisClient.hSet(`cab:${cabId}`, {
            status: 'booked',
        });

        // Store trip details in Redis
        const tripKey = `trip:${userId}:${cabId}`;
        await redisClient.hSet(tripKey, {
            userId,
            cabId,
            source,
            destination,
            startTime: new Date().toISOString(),
            status: 'ongoing',
        });

        // Asynchronously update cab status in MySQL
        connection.query(
            'UPDATE cabs SET status = ? WHERE cabId = ?',
            ['booked', cabId],
            (err) => {
                if (err) {
                    console.error('Error updating cab status in SQL:', err);
                }
            }
        );

        // Insert trip details into `trips` table in MySQL
        connection.query(
            'INSERT INTO trips (user_id, cabId, source, destination, start_time, status) VALUES (?, ?, ?, ?, NOW(), ?)',
            [userId, cabId, source, destination, 'ongoing'],
            (err) => {
                if (err) {
                    console.error('Error inserting trip details into SQL:', err);
                }
            }
        );

        res.status(200).json({ message: 'Cab booked successfully.' });
    } catch (error) {
        console.error('Error booking cab:', error);
        res.status(500).json({ message: 'Failed to book cab.' });
    }
});

// POST endpoint to cancel a trip
router.post("/cancelTrip/:userId/:cabId", async (req, res) => {
    const { userId, cabId } = req.params;

    // Check if parameters are present
    if (!userId || !cabId) {
        return res.status(400).json({ message: 'Missing required details: userId and cabId are required.' });
    }

    try {
        // Check if the trip exists before updating
        const tripCheckQuery = "SELECT * FROM trips WHERE user_id = ? AND cabId = ? AND status != 'completed'";
        connection.query(tripCheckQuery, [userId, cabId], (err, results) => {
            if (err) {
                console.error("Error checking trip status in MySQL:", err);
                return res.status(500).json({ message: "Failed to check trip." });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No ongoing trip found for the specified user and cab." });
            }

            // Update trip status to 'cancelled' in MySQL
            const updateTripQuery = "UPDATE trips SET status = ? WHERE user_id = ? AND cabId = ? AND status = 'ongoing'";
            connection.query(updateTripQuery, ["cancelled", userId, cabId], (err) => {
                if (err) {
                    console.error("Error updating trip status in MySQL:", err);
                    return res.status(500).json({ message: "Failed to cancel trip." });
                }

                // Remove the trip data from Redis
                redisClient.del(`trip:${userId}:${cabId}`, (err) => {
                    if (err) {
                        console.error("Error deleting trip data from Redis:", err);
                    }
                });

                // Mark cab as available in Redis
                redisClient.hSet(`cab:${cabId}`, { status: 'available' });

                // Also update cab status in SQL
                const updateCabQuery = "UPDATE cabs SET status = ? WHERE cabId = ?";
                connection.query(updateCabQuery, ["available", cabId], (err) => {
                    if (err) {
                        console.error("Error updating cab status in MySQL:", err);
                        return res.status(500).json({ message: "Failed to update cab status." });
                    }

                    res.status(200).json({ message: "Trip cancelled successfully." });
                });
            });
        });
    } catch (error) {
        console.error("Error cancelling trip:", error);
        res.status(500).json({ message: "Failed to cancel trip." });
    }
});

// POST endpoint to complete a trip
router.post("/completeTrip/:userId/:cabId", async (req, res) => {
    const { userId, cabId } = req.params;

    // Check if parameters are present
    if (!userId || !cabId) {
        return res.status(400).json({ message: 'Missing required details: userId and cabId are required.' });
    }

    try {
        // Check if the trip exists before updating
        const tripCheckQuery = "SELECT * FROM trips WHERE user_id = ? AND cabId = ? AND status = 'ongoing'";
        connection.query(tripCheckQuery, [userId, cabId], (err, results) => {
            if (err) {
                console.error("Error checking trip status in MySQL:", err);
                return res.status(500).json({ message: "Failed to check trip." });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No ongoing trip found for the specified user and cab." });
            }

            // Update trip status to 'completed' and set end_time in MySQL
            const updateTripQuery = "UPDATE trips SET status = ?, end_time = NOW() WHERE user_id = ? AND cabId = ? AND status = 'ongoing'";
            connection.query(updateTripQuery, ["completed", userId, cabId], (err) => {
                if (err) {
                    console.error("Error updating trip status in MySQL:", err);
                    return res.status(500).json({ message: "Failed to complete trip." });
                }

                // Remove the trip data from Redis
                redisClient.del(`trip:${userId}:${cabId}`, (err) => {
                    if (err) {
                        console.error("Error deleting trip data from Redis:", err);
                    }
                });

                // Mark cab as available in Redis
                redisClient.hSet(`cab:${cabId}`, { status: 'available' });

                // Also update cab status in SQL
                const updateCabQuery = "UPDATE cabs SET status = ? WHERE cabId = ?";
                connection.query(updateCabQuery, ["available", cabId], (err) => {
                    if (err) {
                        console.error("Error updating cab status in MySQL:", err);
                        return res.status(500).json({ message: "Failed to update cab status." });
                    }

                    res.status(200).json({ message: "Trip completed successfully." });
                });
            });
        });
    } catch (error) {
        console.error("Error completing trip:", error);
        res.status(500).json({ message: "Failed to complete trip." });
    }
});

export default router; // Export the router

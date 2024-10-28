import axios from 'axios';
import { redisClient } from '../config/redis.js';

const setupSocket = (io) => {
    io.on('connection', async (socket) => {
        console.log('A user connected:', socket.id);

        // Fetch initial cab details, ensuring only id, latitude, longitude, and status are used
        let initialCabs;
        try {
            const redisResponse = await axios.get('http://localhost:5000/cabs/redis'); // Fetch from Redis
            console.log("Response from Redis:", redisResponse.data); // Log the raw response

            initialCabs = redisResponse.data.map(cab => ({
                id: cab.id, 
                latitude: cab.latitude,
                longitude: cab.longitude,
                status: cab.status 
            }));

            console.log("Mapped cabs from Redis:", initialCabs); // Log the mapped data

            // Check if Redis returned no cabs, fallback to MySQL if empty
            if (!initialCabs || initialCabs.length === 0) {
                console.log("No cabs found in Redis, falling back to MySQL...");
                const mysqlResponse = await axios.get('http://localhost:5000/cabs/mysql');
                console.log("Response from MySQL:", mysqlResponse.data); // Log the raw response

                initialCabs = mysqlResponse.data.map(cab => ({
                    id: cab.id, 
                    latitude: cab.latitude,
                    longitude: cab.longitude,
                    status: cab.status 
                }));

                console.log("Mapped cabs from MySQL:", initialCabs); // Log the mapped data

                // Populate Redis with data fetched from MySQL
                for (const cab of initialCabs) {
                    try {
                        await axios.post('http://localhost:5000/cabs/redis', {
                            id: cab.id,
                            latitude: cab.latitude,
                            longitude: cab.longitude,
                            status: cab.status, 
                        });
                        console.log(`Inserted cab ${cab.id} into Redis.`);
                    } catch (populateError) {
                        console.error('Error populating Redis with cab data:', populateError);
                    }
                }
            } else {
                console.log("Initial cabs fetched from Redis:", initialCabs);
            }
        } catch (error) {
            console.error("Error fetching initial cabs from Redis:", error);

            // Fallback to fetch from MySQL
            try {
                const mysqlResponse = await axios.get('http://localhost:5000/cabs/mysql');
                console.log("Response from MySQL:", mysqlResponse.data); // Log the raw response

                initialCabs = mysqlResponse.data.map(cab => ({
                    id: cab.id,
                    latitude: cab.latitude,
                    longitude: cab.longitude,
                    status: cab.status 
                }));

                console.log("Mapped cabs from MySQL:", initialCabs); // Log the mapped data
            } catch (err) {
                console.error("Error fetching initial cabs from MySQL:", err);
                return; // Exit if both fetches fail
            }
        }

        // Emit updated cab locations every 3 seconds
        const interval = setInterval(async () => {
            const updatedCabs = initialCabs.map(cab => {
                const newLat = cab.latitude + (Math.random() - 0.5) * 0.01;
                const newLng = cab.longitude + (Math.random() - 0.5) * 0.01;

                return {
                    id: cab.id,
                    position: { lat: newLat, lng: newLng },
                    status: cab.status
                };
            });

            console.log('Updated cab locations:', updatedCabs);
            socket.emit('cabLocations', updatedCabs);

            // Store updated locations in Redis using the /redis POST route
            for (const cab of updatedCabs) {
                try {
                    if (!cab.id) {
                        console.error('Cab ID is undefined, skipping insertion into Redis:', cab);
                        continue;
                    }
                    await axios.post('http://localhost:5000/cabs/redis', {
                        id: cab.id,
                        latitude: cab.position.lat,
                        longitude: cab.position.lng,
                        status: cab.status, 
                    });
                    console.log(`Updated cab ${cab.id} in Redis.`);
                } catch (postError) {
                    console.error('Error updating cab location in Redis:', postError);
                }
            }
        }, 3000);

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
            clearInterval(interval); // Clear interval when the socket disconnects
        });
    });
};

export default setupSocket;

import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis in redis.js');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
};

connectRedis();

export { redisClient, connectRedis };

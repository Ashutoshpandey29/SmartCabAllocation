import cors from 'cors';

const corsOptions = {
    origin: 'http://localhost:5173', // Allow requests from your frontend
    methods: ['GET', 'POST'], // Include any other HTTP methods as needed
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    optionsSuccessStatus: 200, // For legacy browsers that choke on 204
};

const configureCors = () => cors(corsOptions);

export default configureCors;

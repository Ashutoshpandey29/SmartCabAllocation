import cors from 'cors';

const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST'], 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], 
    optionsSuccessStatus: 200,
};

const configureCors = () => cors(corsOptions);

export default configureCors;

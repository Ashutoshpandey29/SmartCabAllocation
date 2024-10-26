import express from "express";
import http from "http";
import { Server } from "socket.io";
import configureCors from "./middlewares/cors.js";
import cabs from "./routes/cabs.js"; // Import routes
import setupSocket from "./socket/socket.js"; // Import socket logic
import connection from "./config/db.js"; // Import the database connection
import tables from "./models/tables.js"; // Import the function to create tables
import map from "./routes/map.js";
import trips from "./routes/trips.js";
import booking from "./routes/booking.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);

// Apply CORS middleware
app.use(express.json());
app.use(configureCors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Initialize socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//tables(); // Create tables if they don't exist

setupSocket(io); // Setup socket.io logic

// Use routes
app.use("/cabs", cabs);

app.use("/places", map); 

app.use("/trips", trips);

app.use("/booking", booking);

app.get("/", (req, res) => {
  console.log("Received GET request on /");
  res.json({ message: "Hello from the server!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

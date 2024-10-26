import express from "express";
import axios from "axios";
const router = express.Router();
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.GOOGLE_MAPS_API_KEY);

router.get("/autocomplete", async (req, res) => {
  try {
    const { input } = req.query;
    console.log(input);
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      {
        params: {
          input,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching place suggestions:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Directions Route
router.get("/directions", async (req, res) => {
  const origin = req.query.source;
  const destination = req.query.destination;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  console.log("origin", origin);
  console.log("destination", destination);
  console.log("apiKey", apiKey);

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin,
          destination,
          key: apiKey,
        }
      }
    );

    // Extracting relevant data from the response
    const results = response.data;
    if (results.length === 0) {
      return res.status(404).json({ error: "No routes found" });
    }

    // const route = routes[0].overview_polyline.points;
    // const distance = routes[0].legs[0].distance.text; // Human-readable distance
    // const duration = routes[0].legs[0].duration.text; // Human-readable duration

    //res.json({ route, distance, duration }); // Send everything
    res.json(results); // Send everything
    console.log(res);
  } catch (error) {
    console.error("Error fetching directions data:", error);
    res.status(500).json({ error: "Error fetching directions data" });
  }
});


// Geocoding Route
router.get("/geocode", async (req, res) => {
  const { address } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  console.log("address", address);
  console.log("apiKey", apiKey);

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );
  
    const location = response.data.results[0].geometry.location;
    console.log(location);
    res.json(location);
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    res.status(500).json({ error: "Error fetching geocoding data" });
  }
});

export default router;

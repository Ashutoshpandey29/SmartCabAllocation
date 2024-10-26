// hooks/useGeocode.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useGeocode = (source, destination) => {
  const [coordinates, setCoordinates] = useState({ sourceCoords: null, destinationCoords: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      setLoading(true);
      setError(null);

      console.log(source, destination);

      try {
        // Fetch source coordinates
        let sourceCoords = null;
        if (source) {
          const sourceResponse = await axios.get(`http://localhost:5000/places/geocode?address=${source}`);
          sourceCoords = sourceResponse.data;
        }

        console.log("source coordinates", sourceCoords);



        // Fetch destination coordinates
        let destinationCoords = null;
        if (destination) {
          const destinationResponse = await axios.get(`http://localhost:5000/places/geocode?address=${destination}`);
          destinationCoords = destinationResponse.data;
        }

        console.log("Destination Coordinates", destinationCoords);

        setCoordinates({ sourceCoords, destinationCoords });
      } catch (error) {
        console.error("Error fetching geocoding data: ", error);
        setError("Failed to fetch coordinates. Please check the addresses.");
      } finally {
        setLoading(false);
      }
    };

    if (source || destination) {
      fetchCoordinates();
    }
  }, [source, destination]);

  return { coordinates, loading, error };
};

export default useGeocode;

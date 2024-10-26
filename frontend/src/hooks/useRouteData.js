import { useState, useEffect } from 'react';
import axios from 'axios';

const useRouteData = (source, destination) => {
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/places/directions`, {
          params: { source, destination },
        });
        
        // Update route data with the new structure
        setRouteData({
          // route: response.data.route,
          // distance: response.data.distance,
          // duration: response.data.duration,
          response
        });

        console.log(response.data); // Check the response data
      } catch (error) {
        console.error("Error fetching route:", error);
        setError("Error fetching route data");
      }
    };

    if (source && destination) fetchRoute();
  }, [source, destination]);

  return { routeData, error };
};

export default useRouteData;

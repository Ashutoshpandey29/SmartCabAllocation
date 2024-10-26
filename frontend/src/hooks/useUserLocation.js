import { useEffect, useState } from 'react';

const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleLocationUpdate = (position) => {
      const { latitude, longitude } = position.coords;
      console.log("User's current location:", { lat: latitude, lng: longitude });
      setUserLocation({ lat: latitude, lng: longitude });
    };

    const getUserLocation = () => {
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          handleLocationUpdate,
          (err) => {
            setError("Location access denied. Please allow location access.");
            console.error(err);
          }
        );

        // Clean up the watchPosition on component unmount
        return () => navigator.geolocation.clearWatch(watchId);
      } else {
        setError("Geolocation is not supported by this browser.");
      }
    };

    getUserLocation();
  }, []);

  return { userLocation, error };
};

export default useUserLocation;

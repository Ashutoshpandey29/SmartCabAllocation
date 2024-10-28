// src/NearbyCabs.jsx
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NearbyCabs = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyCabs, setNearbyCabs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Function to get user's current location
        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const { latitude, longitude } = position.coords;
                        console.log("User's current location:", { lat: latitude, lng: longitude }); 
                        setUserLocation({ lat: latitude, lng: longitude });
                    },
                    () => {
                        setError("Location access denied. Please allow location access.");
                        setTimeout(getUserLocation, 5000);
                    }
                );
            } else {
                setError("Geolocation is not supported by this browser.");
            }
        };

        getUserLocation();
    }, []);

    useEffect(() => {
        // Fetch nearby cabs when userLocation is available
        if (userLocation) {
            fetchNearbyCabs(userLocation);
        }
    }, [userLocation]); 

    const fetchNearbyCabs = async (location) => {
        try {
            const response = await axios.get('http://localhost:5000/api/cabs'); 
            const allCabs = response.data;

            console.log("Fetched cabs from API:", allCabs); 

            const nearby = allCabs.filter(cab => {
                const distance = calculateDistance(location, cab.position);
                console.log(`Distance between user and ${cab.cab_number}: ${distance} km`); 
                return distance < 1000; 
            });

            setNearbyCabs(nearby);

            console.log("Nearby cabs:", nearby); 
        } catch (err) {
            console.error('Error fetching cabs:', err);
            setError('Could not fetch cab locations.');
        }
    };

    const calculateDistance = (loc1, loc2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
        const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers

        console.log("Calculated distance:", distance);
        return distance;
    };

    return (
        <div>
            <h2>Nearby Cabs</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {userLocation && nearbyCabs.length > 0 ? (
                <ul>
                    {nearbyCabs.map(cab => (
                        <li key={cab.id}>
                            {cab.cab_number} - Latitude: {cab.position.lat.toFixed(4)}, Longitude: {cab.position.lng.toFixed(4)}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No nearby cabs found.</p>
            )}
        </div>
    );
};

export default NearbyCabs;

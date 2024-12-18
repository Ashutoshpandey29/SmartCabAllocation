// src/NearbyCabs.jsx
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const RealTimeNearbyCabs = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyCabs, setNearbyCabs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
       
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
        if (userLocation) {
            
            socket.on('cabLocations', (updatedCabs) => {
                console.log('Received updated cab locations:', updatedCabs); 

                const nearby = updatedCabs.filter(cab => {
                    const distance = calculateDistance(userLocation, cab.position);
                    console.log(`Distance between user and ${cab.id}: ${distance} km`); 
                    return distance < 2000; // Distance in kilometers
                });

                setNearbyCabs(nearby);
                console.log("Nearby cabs:", nearby); 
            });
        }

        return () => {
            socket.off('cabLocations'); // Clean up the listener when the component unmounts
        };
    }, [userLocation]);

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
                            {cab.id} - Latitude: {cab.position.lat.toFixed(4)}, Longitude: {cab.position.lng.toFixed(4)}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No nearby cabs found.</p>
            )}
        </div>
    );
};

export default RealTimeNearbyCabs;

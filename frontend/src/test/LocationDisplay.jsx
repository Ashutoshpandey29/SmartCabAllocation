// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const LocationDisplay = () => {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 26.1423104,
    lng: 91.7569536,
  });
  
  const [cabs, setCabs] = useState([
    // Three cabs within 10 km
    { id: 1, position: { lat: 26.145, lng: 91.758 } }, // ~2 km away
    { id: 2, position: { lat: 26.138, lng: 91.750 } }, // ~3 km away
    { id: 3, position: { lat: 26.148, lng: 91.762 } }, // ~5 km away
    // One cab outside of 10 km
    { id: 4, position: { lat: 26.180, lng: 91.800 } }, // ~15 km away
]);


  // Function to get the current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log("Current location:", currentLocation); // Log the current location
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Use useEffect to get the current location when the component mounts
  useEffect(() => {
    getCurrentLocation();

    // Socket event listener for cab location updates
    socket.on('cabLocations', (updatedCabs) => {
      console.log('Received updated cab locations:', updatedCabs); 
      setCabs(updatedCabs); 
    });

    // Cleanup socket listener on component unmount
    return () => {
      socket.off('cabLocations');
      console.log('Cleanup: Removed cab location listener'); // Log cleanup
    };
  }, []);

  return (
    <APIProvider
      apiKey={"AIzaSyAoTAa2RhvlIjG2cUe1zKIN4L5LneTBLKg"}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      <Map
        mapId={"CabMap"}
        className="map-container"
        defaultZoom={13}
        defaultCenter={currentLocation} 
        onCameraChanged={(ev) =>
          console.log(
            "Camera changed:",
            ev.detail.center,
            "Zoom:",
            ev.detail.zoom
          )
        }
      >
        {/* Marker for the current location */}
        <AdvancedMarker
          position={currentLocation} 
          title="You are here"
        />

        {/* Markers for nearby cabs with custom icons */}
        {cabs.map((cab) => (
          <AdvancedMarker
            key={cab.id}
            position={cab.position} 
            title={`Cab ${cab.id}`}
          >
            <Pin
              background={"#FBBC04"} 
              glyphColor={"#000"} 
              borderColor={"#000"}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
};

export default LocationDisplay;

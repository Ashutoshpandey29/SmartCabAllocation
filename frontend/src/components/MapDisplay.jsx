import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import MapMarkers from "./MapMarkers";
import useUserLocation from "../hooks/useUserLocation";
import useCabLocations from "../services/socketService";
import useGeocode from "../hooks/useGeocode";

const MapDisplay = ({ source, destination }) => {
  const { userLocation, error } = useUserLocation();
  const cabs = useCabLocations();
  const { coordinates, loading, geocodeError } = useGeocode(
    source,
    destination
  );

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        mapId={"CabMap"}
        className="map-container"
        defaultCenter={{ lat: 26.069088, lng: 91.5687081 }}
        defaultZoom={9}
        gestureHandling={"greedy"}
        fullscreenControl={false}
      >
        <MapMarkers
          currentLocation={userLocation}
          cabs={cabs}
          sourceCoords={coordinates.sourceCoords}
          destinationCoords={coordinates.destinationCoords}
        />
        <Directions source={source} destination={destination} />
      </Map>
      {error && (
        <p style={{ color: "red", textAlign: "center" }}>
          {error}. Please enable location access in your browser settings.
        </p>
      )}
      {geocodeError && (
        <p style={{ color: "red", textAlign: "center" }}>{geocodeError}</p>
      )}
      {loading && <p>Loading route...</p>}
    </APIProvider>
  );
};

function Directions({ source, destination }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();
  const [routes, setRoutes] = useState([]);
  const [routeIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false); // State for tooltip visibility
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  // Use directions service with dynamic source and destination
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !source || !destination)
      return;

    directionsService
      .route({
        origin: source,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
      });
  }, [directionsService, directionsRenderer, source, destination]);

  // Update direction route
  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  return (
    <div className="directions mb-20">
      {leg && (
        <>
          <div className="flex items-center justify-around p-2 bg-gray-100 rounded-lg shadow-md">
            <div className="flex items-center space-x-2">
              <img src="distance.png" alt="Distance" className="w-20 h-20" />
              <span className="text-sm font-medium">{leg.distance?.text}</span>
            </div>
            <div className="flex items-center space-x-2">
              <img src="time.png" alt="Time" className="w-20 h-20" />
              <span className="text-sm font-medium">{leg.duration?.text}</span>
            </div>
          </div>
  
          {/* Tooltip on hover */}
          <div className="absolute top-4 right-12 mb-10"> {/* Changed position */}
            <button
              className="p-2 bg-blue-500 text-white rounded-lg"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              Route Details
            </button>
            {showTooltip && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-3 bg-gray-800 text-white rounded-lg shadow-lg">
                <p>{leg.start_address} to {leg.end_address}</p>
                <p>Distance: {leg.distance?.text}</p>
                <p>Duration: {leg.duration?.text}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );  
}

MapDisplay.propTypes = {
  source: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
};
Directions.propTypes = {
  source: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
};

export default MapDisplay;

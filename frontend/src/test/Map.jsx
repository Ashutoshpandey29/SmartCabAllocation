import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  APIProvider,
  Map,
  useMapsLibrary,
  useMap
} from '@vis.gl/react-google-maps';

const Mapa = ({ source, destination }) => {
  console.log("Mapa Component - Source:", source);
  console.log("Mapa Component - Destination:", destination);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        mapId={"CabMap"}
        className="map-container"
        defaultCenter={{ lat: 26.069088, lng: 91.5687081 }}
        defaultZoom={9}
        gestureHandling={'greedy'}
        fullscreenControl={false}
      >
        <Directions source={source} destination={destination} />
      </Map>
    </APIProvider>
  );
};

function Directions({ source, destination }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();
  const [routes, setRoutes] = useState([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  console.log("Directions Component - Source:", source);
  console.log("Directions Component - Destination:", destination);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    console.log("Initializing Directions Service and Renderer");

    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !source || !destination) {
      console.warn("Directions Service or Renderer or source/destination is missing");
      return;
    }
    console.log("Requesting route with origin:", source, "and destination:", destination);

    directionsService
      .route({
        origin: source,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      })
      .then((response) => {
        console.log("Received route response:", response);
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
      })
      .catch((error) => {
        console.error("Error fetching directions:", error);
      });
 
  }, [directionsService, directionsRenderer, source, destination]);

  useEffect(() => {
    if (!directionsRenderer) return;
    console.log("Setting route index to:", routeIndex);
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  if (!leg) {
    console.warn("Leg data is missing.");
    return null;
  }

  return (
    <div className="directions">
      <h2>{selected.summary}</h2>
      <p>
        {leg.start_address.split(',')[0]} to {leg.end_address.split(',')[0]}
      </p>
      <p>Distance: {leg.distance?.text}</p>
      <p>Duration: {leg.duration?.text}</p>

      <h2>Other Routes</h2>
      <ul>
        {routes.map((route, index) => (
          <li key={route.summary}>
            <button onClick={() => setRouteIndex(index)}>
              {route.summary}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Adding PropTypes validation
Mapa.propTypes = {
  source: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
};

Directions.propTypes = {
  source: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
};

export default Mapa;

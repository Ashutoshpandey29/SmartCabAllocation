import PropTypes from "prop-types";
import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const MapMarkers = ({
  currentLocation,
  cabs,
  sourceCoords,
  destinationCoords,
}) => {
  console.log("markers", cabs);
  return (
    <>
      {/* Marker for the current location */}
      {currentLocation && (
        <AdvancedMarker position={currentLocation} title="You are here" />
      )}

      {/* Marker for the source */}
      {sourceCoords && (
        <AdvancedMarker position={sourceCoords} title="Source">
          <Pin
            background={"#4285F4"}
            glyphColor={"#fff"}
            borderColor={"#000"}
          />
        </AdvancedMarker>
      )}

      {/* Marker for the destination */}
      {destinationCoords && (
        <AdvancedMarker position={destinationCoords} title="Destination">
          <Pin
            background={"#7F00FF"}
            glyphColor={"#fff"}
            borderColor={"#000"}
          />
        </AdvancedMarker>
      )}

      {/* Markers for nearby cabs */}

      {cabs.map((cab) => (
        <AdvancedMarker
          key={cab.id}
          position={cab.position}
          title={`Driver: ${cab.id}, Status: ${cab.status}`}
        >
           <img 
            src={cab.status === 'booked' ? '/taxi_booked.png' : '/taxi1.png'} 
            alt="Taxi" 
            style={{ width: '30px', height: '30px' }} // Adjust size as needed
          />
          {/* <Pin
            background={cab.status === "available" ? "#FBBC04" : "#FF5733"}
            glyphColor={"#000"}
            borderColor={"#000"}
          /> */}
        </AdvancedMarker>
      ))}
    </>
  );
};

// PropTypes validation
MapMarkers.propTypes = {
  currentLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  cabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      position: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired,
      }).isRequired,
    })
  ).isRequired,
  sourceCoords: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  destinationCoords: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
};

export default MapMarkers;

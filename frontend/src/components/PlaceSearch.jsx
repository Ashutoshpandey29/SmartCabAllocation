import { useState } from "react";
import axios from "axios";
import PropTypes from 'prop-types';
import useUserLocation from "../hooks/useUserLocation"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const PlacesSearch = ({ setSource, setDestination }) => {
  const [sourceInput, setSourceInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  
  // Use custom hook to get current user location
  const { userLocation } = useUserLocation();
  console.log("User's current location:", userLocation);

  const fetchPlaceSuggestions = async (input, type) => {
    if (!input) return;
    try {
      const response = await axios.get(`http://localhost:5000/places/autocomplete?input=${input}`);
      const suggestions = response.data.predictions.map((prediction) => prediction.description);

      if (type === "source") {
        setSourceOptions(suggestions);
      } else {
        setDestinationOptions(suggestions);
      }
    } catch (error) {
      console.error("Error fetching place suggestions:", error);
    }
  };

  const handleSourceInputChange = (e) => {
    const input = e.target.value;
    setSourceInput(input);
    fetchPlaceSuggestions(input, "source");
  };

  const handleDestinationInputChange = (e) => {
    const input = e.target.value;
    setDestinationInput(input);
    fetchPlaceSuggestions(input, "destination");
  };

  const handleOptionClick = (option, type) => {
    if (type === "source") {
      setSourceInput(option);
      setSource(option);
      setSourceOptions([]);
    } else {
      setDestinationInput(option);
      setDestination(option); 
      setDestinationOptions([]);
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      const { lat, lng } = userLocation;
      setSourceInput(`${lat}, ${lng}`); // Set the source input to the current location
      setSource(`${lat}, ${lng}`); // Update the parent's source state
    } else {
      // Show popup error message
      toast.error("User location is not available.");
    }
  };

  return (
    <>
      <ToastContainer /> {/* Add this line to render the toast notifications */}
      <h2 className="text-2xl font-bold p-4 bg-gray-100">Search Cabs</h2>
      <div className="flex justify-center items-center p-10 bg-gray-100 max-w-full">
        <div className="w-full max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
          <div className="mb-6">
            <label htmlFor="source" className="block text-gray-700 text-sm font-bold mb-2">Source:</label>
            <div className="flex items-center">
              <input
                type="text"
                id="source"
                value={sourceInput}
                onChange={handleSourceInputChange}
                placeholder="Enter Source"
                className="w-full border border-gray-300 p-2 rounded-md mb-2"
              />
              <button
                onClick={handleUseCurrentLocation}
                className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Use Current Location
              </button>
            </div>
            {sourceOptions.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-md max-h-40 overflow-auto">
                {sourceOptions.map((option, index) => (
                  <div key={index} className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => handleOptionClick(option, "source")}>
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="destination" className="block text-gray-700 text-sm font-bold mb-2">Destination:</label>
            <input
              type="text"
              id="destination"
              value={destinationInput}
              onChange={handleDestinationInputChange}
              placeholder="Enter Destination"
              className="w-full border border-gray-300 p-2 rounded-md mb-2"
            />
            {destinationOptions.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-md max-h-40 overflow-auto">
                {destinationOptions.map((option, index) => (
                  <div key={index} className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => handleOptionClick(option, "destination")}>
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

PlacesSearch.propTypes = {
  setSource: PropTypes.func.isRequired,
  setDestination: PropTypes.func.isRequired,
};

export default PlacesSearch;

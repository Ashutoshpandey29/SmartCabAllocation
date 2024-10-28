import { useEffect, useState } from "react";
import { calculateDistance } from "../services/distanceService";
import useCabLocations from "../services/socketService";
import useUserLocation from "../hooks/useUserLocation";
import axios from "axios";
import useGeocode from "../hooks/useGeocode";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import Loader from "../components/Loader"; 
// eslint-disable-next-line react/prop-types
const NearestCabs = ({ source, destination }) => {
  const { currentUser } = useAuth();
  const user_id = currentUser.uid;
  console.log(user_id);
  const cabs = useCabLocations();
  const { userLocation } = useUserLocation();
  const [nearbyCabs, setNearbyCabs] = useState({ available: [], booked: [] });
  const [loading, setLoading] = useState(false); 
  const [isBooking, setIsBooking] = useState(false); 
  const {
    coordinates,
    // eslint-disable-next-line no-unused-vars
    loading: geocodeLoading,
    // eslint-disable-next-line no-unused-vars
    geocodeError,
  } = useGeocode(source, destination);

  useEffect(() => {
    const fetchCabDetails = async () => {
      const filteredCabs = cabs.map((cab) => {
        const distanceToSource = source
          ? calculateDistance(coordinates.sourceCoords, cab.position)
          : calculateDistance(userLocation, cab.position);

        const totalDistance =
          source && destination
            ? calculateDistance(
                coordinates.sourceCoords,
                coordinates.destinationCoords
              ) + distanceToSource
            : 0;

        return { ...cab, distanceToSource, totalDistance };
      });

      const detailsPromises = filteredCabs.map(async (cab) => {
        try {
          const result = await axios.get(
            `http://localhost:5000/cabs/mysql/${cab.id}`
          );
          return {
            ...result.data,
            distanceToSource: cab.distanceToSource,
            totalDistance: cab.totalDistance,
          };
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
          return null;
        }
      });
      const cabDetails = await Promise.all(detailsPromises);
      const availableCabs = cabDetails.filter(
        (cab) => cab && cab[0].status === "available"
      );
      const bookedCabs = cabDetails.filter(
        (cab) => cab && cab[0].status === "booked"
      );

      availableCabs.sort((a, b) => a.distanceToSource - b.distanceToSource);
      bookedCabs.sort((a, b) => a.distanceToSource - b.distanceToSource);
      console.log(nearbyCabs);

      setNearbyCabs({ available: availableCabs, booked: bookedCabs });
    };

    if (
      userLocation ||
      (coordinates?.sourceCoords && coordinates?.destinationCoords)
    ) {
      fetchCabDetails();
    }
  }, [cabs, userLocation, coordinates]);

  const handleBookCab = async (cabId) => {
    setIsBooking(true);
    setLoading(true); 
    console.log("User_id", user_id);
    console.log("Cab_id", cabId);
    console.log("Source", source);
    console.log("Destination", destination);
    try {
      const response = await axios.post(
        `http://localhost:5000/booking/bookCab/${cabId}`,
        {
          userId: user_id, 
          source, 
          destination,
        }
      );
      toast.success(`Cab booked successfully: ${response.data.message}`);
     
    } catch (error) {
      setLoading(false); // Hide loader
      toast.error(`Error booking cab: ${error.message}`);
    } finally {
      setLoading(false); // Hide loader
      setIsBooking(false); // Reset booking state
    }
  };

  return (
    <div className="p-4 bg-gray-50 mt-20">
      <h2 className="text-2xl font-bold mb-4">Nearby Cabs</h2>
      {loading && <Loader />} {/* Show loader */}
      {/* Available Cabs Section */}
      {nearbyCabs.available.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Available Cabs</h3>
          <div className="space-y-4">
            {nearbyCabs.available.map((cab) => (
              <div
                key={cab[0].cabId}
                className="flex items-center justify-between bg-white border border-gray-300 rounded p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <img
                    src="driver.avif"
                    alt={cab[0].driver_name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {cab[0].driver_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Rating: {cab[0].rating}⭐
                    </p>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="flex flex-col items-end">
                    <img
                      src={"sedan.jpg"}
                      alt={`${cab[0].car_type}`}
                      className="w-15 h-10 mr-2"
                    />
                    <p className="text-sm text-gray-600 font-semibold">
                      {cab[0].car_type}
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {cab.distanceToSource.toFixed(2)} km away
                    </p>
                    {source && destination && (
                      <p className="text-lg text-gray-600 font-semibold">
                        Fare: ₹{(cab.totalDistance * 10).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 ">
                    <button
                      onClick={() => handleBookCab(cab[0].cabId)} // Call booking handler
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      {isBooking ? "Booking..." : "Book Cab"}{" "}
                      {/* Change button text based on booking status */}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Booked Cabs Section */}
      {nearbyCabs.booked.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Booked Cabs</h3>
          <div className="space-y-4">
            {nearbyCabs.booked.map((cab) => (
              <div
                key={cab[0].cabId}
                className="flex items-center justify-between bg-orange-200 border border-gray-300 rounded p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <img
                    src="driver.avif"
                    alt={cab[0].driver_name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {cab[0].driver_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Rating: {cab[0].rating}⭐
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <img
                    src="SUV.webp"
                    alt={`${cab[0].car_type}`}
                    className="w-15 h-8 mr-2"
                  />
                  <p className="text-lg font-semibold text-red-600">
                    {cab.distanceToSource.toFixed(2)} km away
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {nearbyCabs.available.length === 0 && nearbyCabs.booked.length === 0 && (
        <p className="text-gray-500">No nearby cabs found.</p>
      )}
    </div>
  );
};

export default NearestCabs;

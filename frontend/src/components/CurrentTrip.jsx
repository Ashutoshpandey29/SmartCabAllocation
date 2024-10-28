import { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from './Loader'; 

const CurrentTrip = () => {
    const { currentUser } = useAuth();
    const user_id = currentUser.uid; 
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOngoingTrips = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/trips/ongoingTrips/${user_id}`);
                if (response.data.length === 0) {
                    toast.error('No current trip in progress');
                } else {
                    setTrips(response.data);
                    toast.success('Fetched ongoing trips successfully'); // Show success toast
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to fetch ongoing trips';
                toast.error(errorMessage); // Show error toast
            } finally {
                setLoading(false);
            }
        };

        fetchOngoingTrips();
    }, [user_id]);

    const handleCancelTrip = async (cabId) => {
        setLoading(true);
        try {
            await axios.post(`http://localhost:5000/booking/cancelTrip/${user_id}/${cabId}`);
            // Remove the cancelled trip from the state
            setTrips((prevTrips) => prevTrips.filter(trip => trip.cabId !== cabId));
            toast.success('Trip cancelled successfully!'); // Show success toast

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to cancel trip';
            toast.error(errorMessage); // Show error toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold">Current Trip</h2>
            {loading ? (
                <Loader /> // Use the Loader component while loading
            ) : (
                <>
                    <div className="flex flex-wrap">
                        {trips.map(trip => (
                            <div key={trip.cabId} className="m-2 p-4 border rounded shadow flex flex-col">
                                <img src="roadway.jpg" alt={trip.cabId} className="w-full h-32 object-cover rounded" />
                                <h3 className="text-lg font-semibold mt-2">{trip.source} to {trip.destination}</h3>
                                <p className="text-gray-600">Status: {trip.status}</p>
                                <button
                                    onClick={() => handleCancelTrip(trip.cabId)}
                                    className="mt-2 bg-red-500 text-white py-2 px-4 rounded"
                                >
                                    Cancel Ride
                                </button>
                            </div>
                        ))}
                    </div>
                    {trips.length === 0 && <p className="mt-2 font-semibold text-gray-700">No current trip in progress.</p>}
                </>
            )}
        </div>
    );
};

export default CurrentTrip;

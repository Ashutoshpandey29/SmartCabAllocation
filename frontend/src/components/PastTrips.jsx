import { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from './Loader'; 

const PastTrips = () => {
    const { currentUser } = useAuth();
    const user_id = currentUser.uid; 
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPastTrips = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/trips/pastTrips/${user_id}`);
                if (response.data.length === 0) {
                    // Show error toast if no past trips are found
                    toast.error('No past trips found');
                } else {
                    setTrips(response.data);
                    toast.success('Fetched past trips successfully'); // Show success toast
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to fetch past trips';
                toast.error(errorMessage); // Show error toast
            } finally {
                setLoading(false);
            }
        };

        fetchPastTrips();
    }, [user_id]);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold">Past Trips</h2>
            {loading ? (
                <Loader /> // Use the Loader component while loading
            ) : (
                <>
                    <div className="flex flex-wrap">
                        {trips.map(trip => (
                            <div key={trip.cabId} className="m-2 p-4 border rounded shadow flex flex-col">
                                <img src="roadway.jpg" alt={trip.cabId} className="w-full h-32 object-cover rounded" />
                                <h3 className="text-lg font-semibold mt-2">{trip.source} to {trip.destination}</h3>
                                <p className="text-gray-600 flex items-center">
                                    <span
                                        className={`w-3 h-3 rounded-full mr-2 ${trip.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}
                                    ></span>
                                    Status: {trip.status}
                                </p>
                            </div>
                        ))}
                    </div>
                    {trips.length === 0 && !loading && <p className="mt-2 text-gray-700 font-semibold">No past trips found.</p>}
                </>
            )}
        </div>
    );
};

export default PastTrips;

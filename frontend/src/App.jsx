import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import MapDisplay from './components/MapDisplay';
import NearestCabs from './components/NearestCabs';
import PlaceSearch from './components/PlaceSearch';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PastTrips from './components/PastTrips';
import CurrentTrip from './components/CurrentTrip';
import Rewards from './components/Rewards';
import NotFound from './components/NotFound';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';

function App() {
    const [, setMessage] = useState('');
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");

    useEffect(() => {
        const fetchMessage = async () => {
            try {
                const response = await fetch('http://localhost:5000/');
                const data = await response.json();
                console.log('Message from backend:', data.message);
                setMessage(data.message);
            } catch (error) {
                console.error('Error fetching message:', error);
            }
        };

        fetchMessage();
    }, []);

    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col"> 
                    <Navbar />
                    <main className="flex-grow"> 
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/" element={
                                <PrivateRoute>
                                    <>
                                        <PlaceSearch setSource={setSource} setDestination={setDestination} />
                                        <MapDisplay source={source} destination={destination} />
                                        <NearestCabs source={source} destination={destination} />
                                    </>
                                </PrivateRoute>
                            } />
                            <Route path="/past-trips" element={<PrivateRoute><PastTrips /></PrivateRoute>} />
                            <Route path="/current-trip" element={<PrivateRoute><CurrentTrip /></PrivateRoute>} />
                            <Route path="/rewards" element={<PrivateRoute><Rewards /></PrivateRoute>} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

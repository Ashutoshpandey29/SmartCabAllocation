import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; 

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser, logout } = useAuth(); 

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-gray-900 flex justify-between items-center p-4">
            <h1 className="text-white text-2xl font-bold">MOVE IN SYNC CAB BOOKING</h1>
            <div className="relative">
                <button onClick={toggleMenu} className="text-white focus:outline-none">
                    <FaBars size={24} />
                </button>
                {isOpen && (
                    <div className="absolute right-0 bg-dark-gray rounded shadow-md">
                        <ul className="flex flex-col p-2 bg-gray-400 rounded-md">
                            {currentUser ? (
                                <>
                                    <li className="py-2 px-4 hover:bg-gray-700 rounded">
                                        <Link to="/" onClick={logout} className="text-white">Logout</Link>
                                    </li>
                                    <li className="py-2 px-4 hover:bg-gray-700 rounded">
                                        <Link to="/past-trips" className="text-white">Past Trips</Link>
                                    </li>
                                    <li className="py-2 px-4 hover:bg-gray-700 rounded">
                                        <Link to="/current-trip" className="text-white">Current Trip</Link>
                                    </li>
                                    <li className="py-2 px-4 hover:bg-gray-700 rounded">
                                        <Link to="/rewards" className="text-white">Rewards</Link>
                                    </li>
                                    <li className="py-2 px-4 hover:bg-gray-700 rounded">
                                        <Link to="/" className="text-white">Home</Link>
                                    </li>
                                </>
                            ) : (
                                <li className="py-2 px-4 hover:bg-gray-700 rounded">
                                    <Link to="/login" className="text-white">Login</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

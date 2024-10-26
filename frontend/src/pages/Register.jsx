// src/components/Register.js
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); // Initialize useNavigate

    const handleRegister = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast.success("Registration successful!");
            navigate("/login"); // Redirect to login page
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Registration failed. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <div className="bg-white shadow-lg rounded-lg p-8 w-96">
                <h2 className="text-center text-2xl font-semibold mb-4">Register</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 p-2 rounded mb-4 w-full"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 p-2 rounded mb-4 w-full"
                />
                <button
                    onClick={handleRegister}
                    className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition duration-200"
                >
                    Register
                </button>
            </div>
            <ToastContainer /> {/* Add ToastContainer for notifications */}
        </div>
    );
};

export default Register;

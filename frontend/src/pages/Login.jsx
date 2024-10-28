import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";
import { Link, useNavigate } from "react-router-dom"; 
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"; 
import { setPersistence, browserLocalPersistence } from "firebase/auth"; 

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState(""); 
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null); 
    const navigate = useNavigate();


    const handleEmailLogin = async () => {
        try {
            await setPersistence(auth, browserLocalPersistence); 
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Login successful!");
            navigate("/"); // Redirect to home page after successful login
        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await setPersistence(auth, browserLocalPersistence); 
            await signInWithPopup(auth, googleProvider);
            toast.success("Google login successful!");
            navigate("/"); // Redirect to home page after successful login
        } catch (error) {
            toast.error("Google login failed. Please try again.");
        }
    };

    const handleForgotPassword = async () => {
        try {
            await setPersistence(auth, browserLocalPersistence); 
            await sendPasswordResetEmail(auth, forgotPasswordEmail);
            toast.success("Password reset email sent!");
            setIsForgotPassword(false);
        } catch (error) {
            toast.error("Failed to send reset email.");
        }
    };   
    const handleSendOtp = async () => {
        const auth = getAuth(); 
        // Set up reCAPTCHA verifier
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved - will proceed with sending OTP
            },
            'expired-callback': () => {
                // Response expired. Ask user to re-submit the CAPTCHA
            }
        }, auth);
    
        const appVerifier = window.recaptchaVerifier;
    
        try {
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(result);
            toast.success("OTP sent!");
            setIsOtpSent(true);
        } catch (error) {
            console.error("Error sending OTP: ", error);
            toast.error("Failed to send OTP. " + error.message);
        }
    };
    
    

    // Function to verify OTP
    const handleVerifyOtp = async () => {
        try {
            const result = await confirmationResult.confirm(otp);
            toast.success("Phone authentication successful!");
            navigate("/"); // Redirect to home page after successful login
        } catch (error) {
            toast.error("OTP verification failed.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <div className="bg-white shadow-lg rounded-lg p-8 w-96 lg:w-1/3"> 
                <div className="flex items-center justify-center mb-4">
                    <img src="google-logo.png" alt="Google Logo" className="w-12 h-12" />
                    <img src="gmail-logo.jpg" alt="Gmail Logo" className="w-20 h-20" />
                </div>
                <h2 className="text-center text-2xl font-semibold mb-4">Login</h2>
                
                {isForgotPassword ? (
                    <div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            className="border border-gray-300 p-2 rounded mb-4 w-full"
                        />
                        <button
                            onClick={handleForgotPassword}
                            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition duration-200"
                        >
                            Reset Password
                        </button>
                        <button
                            onClick={() => setIsForgotPassword(false)}
                            className="text-blue-500 hover:underline mt-4 w-full"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : isOtpSent ? (
                    <div>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="border border-gray-300 p-2 rounded mb-4 w-full"
                        />
                        <button
                            onClick={handleVerifyOtp}
                            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition duration-200"
                        >
                            Verify OTP
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* <input
                            type="text"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="border border-gray-300 p-2 rounded mb-4 w-full"
                        />
                        <button
                            onClick={handleSendOtp}
                            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition duration-200"
                        >
                            Send OTP
                        </button>
                        <div className="flex items-center my-4">
                            <div className="border-t border-dashed border-gray-300 flex-grow"></div>
                            <span className="mx-2">OR</span>
                            <div className="border-t border-dashed border-gray-300 flex-grow"></div>
                        </div> */}
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
                            onClick={handleEmailLogin}
                            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition duration-200"
                        >
                            Login with Email
                        </button>
                        <div className="flex items-center my-4">
                            <div className="border-t border-dashed border-gray-300 flex-grow"></div>
                            <span className="mx-2">OR</span>
                            <div className="border-t border-dashed border-gray-300 flex-grow"></div>
                        </div>
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center border border-gray-300 p-2 rounded w-full mt-4"
                        >
                            <img src="google-logo.png" alt="Google Logo" className="w-5 h-5 mr-2" />
                            Login with Google
                        </button>
                        <button
                            onClick={() => setIsForgotPassword(true)}
                            className="text-blue-500 hover:underline mt-4 w-full"
                        >
                            Forgot Password?
                        </button>
                        <Link to="/register" className="block text-center mt-4 text-blue-500 hover:underline">
                            Register using Email/Password
                        </Link>
                    </div>
                )}
                <div id="recaptcha-container"></div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Login;

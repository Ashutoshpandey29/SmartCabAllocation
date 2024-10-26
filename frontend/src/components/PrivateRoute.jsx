// src/components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();
    console.log("Current User in PrivateRoute:", currentUser);
    return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

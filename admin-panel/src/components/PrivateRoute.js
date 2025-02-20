import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "admin") {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;

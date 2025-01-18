import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';



const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    console.log('PrivateRoute - loading:', loading);
    console.log('PrivateRoute - isAuthenticated:', isAuthenticated);

    if (loading) {
        console.log('Загрузка состояния авторизации', loading);
        return <div>Загрузка...</div>;
    }

    console.log('Состояние авторизации:', isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        console.log('Проверка токена в localStorage:', token);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Проверяем, не истёк ли токен
                if (decoded.exp * 1000 > Date.now()) {
                    setAuthenticated(true);
                    console.log(isAuthenticated)
                } else {
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error('Ошибка декодирования токена:', error);
                localStorage.removeItem('authToken');
            }
        }
        setLoading(false);
    }, [isAuthenticated]);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        setAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

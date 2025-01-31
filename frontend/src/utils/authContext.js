import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState({}); // По умолчанию пустой объект, а не null
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        console.log('Проверка токена в localStorage:', token);

        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setAuthenticated(true);
                    setUser({
                        id: decoded.id || '',
                        role: decoded.role || '',
                        name: decoded.name || '',
                    });
                } else {
                    localStorage.removeItem('authToken');
                    setAuthenticated(false);
                    setUser({});
                }
            } catch (error) {
                console.error('Ошибка декодирования токена:', error);
                localStorage.removeItem('authToken');
                setAuthenticated(false);
                setUser({});
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        const decoded = jwtDecode(token);
        setAuthenticated(true);
        setUser({
            id: decoded.id,
            role: decoded.role,
            name: decoded.name,
        });
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setAuthenticated(false);
        setUser({});
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

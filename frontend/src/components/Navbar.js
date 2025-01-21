import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import  '../styles/Navbar.css';


const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getPageTitle = () => {
        switch (location.pathname) {
            case "/orders":
                return "Доступные заказы";
            case "/active-orders":
                return "Ваши активные заказы";
            case "/profile":
                return "Профиль";
            case "/create-order":
                return "Создание заказа";
            case "/login":
                return "Авторизация";
            default:
                return "CargoCamp"; // Значение по умолчанию
        }
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-item">
                    Home
                </Link>
            </div>
            <div className="navbar-title">{getPageTitle()}</div>

            <button className="navbar-button" onClick={handleProfileClick}>
                Profile
            </button>
        </nav>
    );
};

export default Navbar;

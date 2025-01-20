import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import  '../styles/Navbar.css';


const Navbar = () => {
    const navigate = useNavigate();

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
            <button className="navbar-button" onClick={handleProfileClick}>
                Profile
            </button>
        </nav>
    );
};

export default Navbar;

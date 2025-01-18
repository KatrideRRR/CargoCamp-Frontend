import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Navbar = () => {

    const navigate = useNavigate();

    const handleProfileClick = () => {

            navigate('/profile'); // Если пользователь авторизован, переходим на страницу профиля

    };

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                backgroundColor: '#f8f8f8',
                padding: '10px',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            <div>
                <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
            </div>
            <div>
                <button
                    onClick={handleProfileClick}
                    style={{
                        textDecoration: 'none',
                        marginRight: 30,
                        color: 'blue',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Profile
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

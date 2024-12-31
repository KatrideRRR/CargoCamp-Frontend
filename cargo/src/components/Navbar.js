import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
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
        <Link to="/profile" style={{ textDecoration: 'none', marginRight: 30, color: 'blue' }}>Profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;

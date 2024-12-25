import React from 'react';
import { Link } from 'react-router-dom';

const BottomMenu = () => {
  return (
    <nav style={{ position: 'fixed', bottom: 0, width: '100%', background: '#f8f9fa', padding: '10px 0', display: 'flex', justifyContent: 'space-around' }}>
      <Link to="/">Главная</Link>
      <Link to="/profile">Профиль</Link>
      <Link to="/messages">Сообщения</Link>
    </nav>
  );
};

export default BottomMenu;
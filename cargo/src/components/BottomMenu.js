import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/BottomMenu.css';

const BottomMenu = () => {
  return (
    <div className="bottom-menu">
      <div className="menu-left">
        <Link to="/orders" className="menu-item">
          Все заказы
        </Link>
        <Link to="/special-orders" className="menu-item">
          Спецзаказы
        </Link>
      </div>

      <div className="menu-center">
        <Link to="/create-order" className="menu-plus">
          +
        </Link>
      </div>

      <div className="menu-right">
        <Link to="/massage" className="menu-item">
          Сообщения
        </Link>
        <Link to="/active-orders" className="menu-item">
          Активные заказы
        </Link>
      </div>
    </div>
  );
};

export default BottomMenu;

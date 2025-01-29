import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, PlusCircle, List } from 'lucide-react'; // Иконки из lucide-react
import '../styles/BottomMenu.css';

const BottomMenu = () => {
    const navigate = useNavigate();

    return (
        <div className="bottom-menu">
            <button
                className="menu-item menu-left"
                onClick={() => navigate('/orders')}
            >
                <List size={20} className="menu-icon" />
                Заказы
            </button>

            <button
                className="menu-item menu-center"
                onClick={() => navigate('/create-order')}
            >
                <PlusCircle size={28} className="menu-icon-plus" />
            </button>

            <button
                className="menu-item menu-right"
                onClick={() => navigate('/active-orders')}
            >
                <ClipboardList size={20} className="menu-icon" />
                Активные
            </button>
        </div>
    );
};

export default BottomMenu;

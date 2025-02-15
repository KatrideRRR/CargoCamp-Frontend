import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, PlusCircle, List } from 'lucide-react'; // Иконки из lucide-react
import '../styles/BottomMenu.css';
import { AuthContext } from '../utils/authContext'; // Подключаем контекст авторизации

const BottomMenu = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Получаем пользователя из контекста
    const handleMyOrdersClick = () => {
        if (user && user.id) {
            navigate(`/my-orders/${user.id}`); // Передаём userId в маршрут
        } else {
            alert('Вы не авторизованы! Пожалуйста, войдите в систему.');
            navigate('/login');        }
    };


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
                onClick={handleMyOrdersClick}
                disabled={!user} // Если пользователя нет, кнопка неактивна
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

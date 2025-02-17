import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, PlusCircle, List } from 'lucide-react';
import '../styles/BottomMenu.css';
import { AuthContext } from '../utils/authContext';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Подключаем сокет

const BottomMenu = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [hasNewRequests, setHasNewRequests] = useState(false);

    useEffect(() => {
        if (!user) return;

        socket.on("orderRequest", (data) => {
            if (data && data.orderId) {
                console.log("🔥 BottomMenu получил событие с orderId:", data.orderId);
                setHasNewRequests(true);
            } else {
                console.error("Ошибка: получены некорректные данные:", data);
            }
        });

        return () => {
            socket.off("orderRequest");
        };
    }, []);


    const handleMyOrdersClick = () => {
        if (user && user.id) {
            navigate(`/my-orders/${user.id}`);
            setHasNewRequests(false); // Сбрасываем уведомление после перехода
        } else {
            alert('Вы не авторизованы! Пожалуйста, войдите в систему.');
            navigate('/login');
        }
    };

    return (
        <div className="bottom-menu">
            <button className="menu-item menu-left" onClick={() => navigate('/orders')}>
                <List size={20} className="menu-icon" />
                Заказы
            </button>

            <button
                className={`menu-item menu-center ${hasNewRequests ? 'highlight' : ''}`}
                onClick={handleMyOrdersClick}
                disabled={!user}
            >
                <PlusCircle size={28} className="menu-icon-plus" />
            </button>

            <button className="menu-item menu-right" onClick={() => navigate('/active-orders')}>
                <ClipboardList size={20} className="menu-icon" />
                Активные
            </button>
        </div>
    );
};

export default BottomMenu;

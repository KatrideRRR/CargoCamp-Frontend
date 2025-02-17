import React, {useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, PlusCircle, List } from 'lucide-react';
import '../styles/BottomMenu.css';
import io from 'socket.io-client';
import {AuthContext} from "../utils/authContext";
const socket = io('http://localhost:5000');

const BottomMenu = () => {
    const navigate = useNavigate();
    const [hasNewRequests, setHasNewRequests] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        socket.connect(); // Подключаем WebSocket

        socket.on("orderRequest", (data) => {
            console.log("🔥 Получен запрос на заказ:", data);
            setHasNewRequests(true);
        });

        return () => {
            socket.off("orderRequest");
        };
    }, []);

    const handleMyOrdersClick = () => {
        navigate(`/my-orders/${user.id}`);
        setHasNewRequests(false); // Сбрасываем флаг после нажатия
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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../styles/ActiveOrdersPage.css';
import { useAuth } from '../utils/authContext';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Подключение к WebSocket

const ActiveOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Вы не авторизованы! Пожалуйста, войдите в систему.');
            navigate('/login');
        }

        const fetchActiveOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/orders/active-orders', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(response.data);
            } catch (err) {
                console.error('Ошибка при загрузке активных заказов:', err);
                setError('Не удалось загрузить заказы.');
            }
        };

        fetchActiveOrders();

        // Подписываемся на обновления активных заказов
        socket.on('activeOrdersUpdated', fetchActiveOrders);

        return () => {
            socket.off('activeOrdersUpdated', fetchActiveOrders); // Очистка слушателя
        };

    }, [navigate]);

    if (!user) {
        return <p>Загрузка...</p>;
    }

    const handleCompleteOrder = async (orderId) => {
        try {
            console.log("Order data before sending to server:", orderId);
            fetch('/api/orders/complete/${orderId}', {
                method: 'POST',
                body: JSON.stringify(orderId),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const token = localStorage.getItem('authToken'); // Добавляем токен для авторизации
            const response = await axios.post(`http://localhost:5000/api/orders/complete/${orderId}`,
                {}, // Тело запроса пустое, но его нужно передать
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedOrder = response.data;
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? updatedOrder : order
                )
            );
        } catch (error) {
            console.error("Ошибка завершения заказа:", error);
        }
    };

    const handleRemoveOrder = (orderId) => {
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
    };

    // Проверка на наличие пользователя перед рендерингом
    if (!user || !user.id) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="orders-container">
            <div className="orders-wrapper">
                {orders.length > 0 ? (
                    <ul className="orders-list">
                        {orders.map((order) => {
                            const isCreator = order.creatorId === user.id;
                            const isExecutor = order.executorId === user.id;
                            const isCompletedByUser = Array.isArray(order.completedBy) && order.completedBy.includes(user.id);
                            const isWaitingForOther = Array.isArray(order.completedBy) && order.completedBy.length === 1;

                            return (
                                <li key={order.id} className="order-card">
                                    <p><strong>Тип:</strong> {order.type}</p>
                                    <p><strong>Описание:</strong> {order.description}</p>
                                    <p><strong>Адрес:</strong> {order.address}</p>
                                    <p><strong>Цена:</strong> {order.proposedSum} ₽</p>
                                    <p><strong>ID создателя:</strong> {order.creatorId}</p>
                                    <p><strong>ID исполнителя:</strong> {order.executorId}</p>
                                    {order.photoUrl && (<img src={`http://localhost:5000${order.photoUrl}`} alt="Фото заказа" className="order-photo"/>) }
                                    <div className="action-buttons">
                                        <button className="call-button" onClick={() => window.open(`tel:${order.phone}`)}>Позвонить</button>
                                        <button className="message-button" onClick={() => navigate(`/messages/${order.id}`)}>Сообщение</button>
                                        <button className="route-button">Маршрут</button>


                                        {isCompletedByUser ? (
                                            isWaitingForOther ? (
                                                <>
                                                    <p>Ожидаем подтверждения {isCreator ? "исполнителя" : isExecutor ? "заказчика" : "второго участника"}</p>
                                                    <button className="remove-button" onClick={() => handleRemoveOrder(order.id)}>
                                                        Удалить из активных
                                                    </button>
                                                </>
                                            ) : null
                                        ) : (
                                            <button className="complete-button" onClick={() => handleCompleteOrder(order.id)}>
                                                Завершить
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="no-orders">Нет активных заказов.</p>
                )}
            </div>
        </div>
    );
};

export default ActiveOrdersPage;

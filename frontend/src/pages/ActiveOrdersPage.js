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
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rating, setRating] = useState(0);


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
        // Показываем модальное окно для оценки
        const orderToComplete = orders.find(order => order.id === orderId);
        setSelectedOrder(orderToComplete); // Устанавливаем выбранный заказ
        setShowRatingModal(true); // Показываем модальное окно для оценки
    };



    const submitRating = async () => {
        if (!selectedOrder || rating === 0) return;

        try {
            const token = localStorage.getItem('authToken');

            // 1. Отправляем оценку на сервер
            await axios.post("http://localhost:5000/api/auth/rate", {
                userId: selectedOrder.executorId === user.id
                    ? selectedOrder.creatorId
                    : selectedOrder.executorId,
                rating,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 2. Завершаем заказ
            await axios.post(`http://localhost:5000/api/orders/complete/${selectedOrder.id}`,
                {}, // Тело запроса пустое
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 3. Обновляем состояние заказов в интерфейсе
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === selectedOrder.id ? { ...order, completed: true } : order
                )
            );

            // 4. Закрываем модальное окно и сбрасываем состояния
            setShowRatingModal(false);
            setSelectedOrder(null);
            setRating(0);

        } catch (error) {
            console.error("Ошибка при завершении заказа или отправке рейтинга", error);
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
                                        {showRatingModal && selectedOrder?.id === order.id && (
                                            <div className="modal">
                                                <h2>Оцените участника</h2>
                                                <div className="stars">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span
                                                            key={star}
                                                            className={star <= rating ? "star selected" : "star"}
                                                            onClick={() => setRating(star)}
                                                        >
                    ★
                </span>
                                                    ))}
                                                </div>
                                                <button onClick={submitRating} disabled={rating === 0}>
                                                    Завершить заказ
                                                </button>
                                            </div>
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
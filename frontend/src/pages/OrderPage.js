import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import '../styles/OrdersPage.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const OrderPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [creator, setCreator] = useState(null);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axiosInstance.get(`/orders/${id}`);
                setOrder(response.data);

                // Загружаем данные о создателе заказа
                const userResponse = await axiosInstance.get(`/auth/${response.data.creatorId}`);
                setCreator(userResponse.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки заказа');
            }
        };
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/auth/profile');
                console.log("👤 Данные пользователя:", response.data);
                setUserId(response.data.id);
                socket.emit('register', response.data.id);
            } catch (err) {
                console.error("❌ Ошибка получения профиля:", err);
            }
        };

        fetchOrder();
        fetchUserData();

        if (userId) {
            console.log("🔄 Подключаем WebSocket для пользователя:", userId);

            socket.on('orderRequested', (data) => {
                console.log("🔔 Получен запрос на заказ:", data);
            });
            socket.on('orderUpdated', fetchOrder);

            return () => {
                socket.off('orderRequested');
                socket.off('orderUpdated');
            };
        }
    }, [userId, id]);

    const handleRequestOrder = async (orderId) => {
        try {
            await axiosInstance.post(`/orders/${orderId}/request`);
            alert("Запрос отправлен заказчику!");
        } catch (error) {
            console.error("Ошибка при запросе на выполнение заказа:", error);
            alert(error.response?.data?.message || "Не удалось отправить запрос");
        }
    };

    if (error) {
        return <div className="error-message">Ошибка: {error}</div>;
    }

    if (!order || !creator) {
        return <div className="loading">Загрузка...</div>;
    }

    return (
        <div className="orders-container">
            <div className="orders-wrapper">
                <ul className="orders-list">
                    <li className="order-card">
                        <div className="order-content">
                            <div className="order-header">
                                <p className="order-title">
                                    <strong>Заказ №{order.id}</strong> от {creator.username || "Неизвестно"}.
                                    Создан {new Date(order.createdAt).toLocaleString()}.
                                </p>
                            </div>

                            <div className="order-left">
                                <p><strong>Тип заказа:</strong> {order.type}</p>
                                <p><strong>Описание:</strong> {order.description}</p>
                                <p><strong>Адрес:</strong> {order.address}</p>
                                <p><strong>Цена:</strong> {order.proposedSum} ₽</p>
                                <p><strong>Имя создателя:</strong> {creator.username || "Неизвестно"}</p>
                                <p><strong>Рейтинг:</strong> {creator.rating ? creator.rating.toFixed(1) : "Нет данных"}</p>
                            </div>

                            {Array.isArray(order.images) && order.images.length > 0 ? (
                                order.images.map((image, index) => {
                                    const imageUrl = `http://localhost:5000${image}`;
                                    return <img key={index} src={imageUrl} alt={`Order Image ${index + 1}`} className="order-image"/>;
                                })
                            ) : (
                                <p>Изображений нет</p>
                            )}
                        </div>

                        {/* Кнопка для перехода на страницу жалоб для создателя */}
                        {creator.username && (
                            <Link to={`/complaints/${order.creatorId}`} className="complaints-button">
                                Жалобы на создателя: {creator.complaintsCount || 0}                                       </Link>
                        )}

                        {userId !== order.creatorId && !order.executorId && order.status === 'pending' && (
                            <button className="take-order-button" onClick={() => handleRequestOrder(order.id)}>Запросить выполнение</button>
                        )}
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default OrderPage;

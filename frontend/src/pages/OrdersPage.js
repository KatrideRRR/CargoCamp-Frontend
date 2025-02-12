import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Link } from 'react-router-dom'; // Импортируем Link для навигации
import '../styles/OrdersPage.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [creatorsInfo, setCreatorsInfo] = useState({}); // Данные о создателях заказов

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get('/orders/all');
                console.log("📦 Загружены заказы:", response.data);
                setOrders(response.data);

                // Получаем данные о создателях заказов
                const creatorIds = [...new Set(response.data.map(order => order.creatorId))]; // Уникальные ID создателей
                const creatorsData = {};

                for (const id of creatorIds) {
                    try {
                        const res = await axiosInstance.get(`/auth/${id}`);
                        creatorsData[id] = res.data; // Сохраняем данные
                    } catch (err) {
                        console.error(`Ошибка загрузки данных пользователя ${id}`, err);
                    }
                }

                setCreatorsInfo(creatorsData);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки заказов');
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

        fetchOrders();
        fetchUserData();

        if (userId) {
            console.log("🔄 Подключаем WebSocket для пользователя:", userId);

            socket.on('orderRequested', (data) => {
                console.log("🔔 Получен запрос на заказ:", data);
            });
            socket.on('orderUpdated', fetchOrders);

            return () => {
                socket.off('orderRequested');
                socket.off('orderUpdated');
            };
        }
    }, [userId]);

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

    return (
        <div className="orders-container">
            <div className="orders-wrapper">
                {orders.length > 0 ? (
                    <ul className="orders-list">
                        {orders.map((order) => {
                            const creator = creatorsInfo[order.creatorId] || {};

                            return (
                                <li className="order-card" key={order.id}>
                                    <div className="order-content">
                                        <div className="order-header">
                                            <p className="order-title">
                                                <strong>Заказ номер {order.id}</strong> от заказчика с
                                                ID {order.creatorId}.
                                                Создан {new Date(order.createdAt).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="order-left">
                                            <p><strong>Тип заказа:</strong> {order.type}</p>
                                            <p><strong>Категория:</strong> {order.category ? order.category.name : 'Не указано'}</p>
                                            <p><strong>Подкатегория:</strong> {order.subcategory ? order.subcategory.name : 'Не указано'}</p>
                                            <p><strong>Описание:</strong> {order.description}</p>
                                            <p><strong>Адрес:</strong> {order.address}</p>
                                            <p><strong>Цена:</strong> {order.proposedSum} ₽</p>
                                            <p><strong>Имя создателя:</strong> {creator.username || "Неизвестно"}</p>
                                            <p><strong>Рейтинг
                                                создателя:</strong> {creator.rating ? creator.rating.toFixed(1) : "Нет данных"}
                                            </p>


                                        </div>

                                        {Array.isArray(order.images) && order.images.length > 0 ? (
                                            order.images.map((image, index) => {
                                                const imageUrl = `http://localhost:5000${image}`;
                                                return <img key={index} src={imageUrl} alt={`Order Image ${index + 1}`}
                                                            className="order-image"/>;
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
                            );
                        })}
                    </ul>
                ) : (
                    <p className="no-orders">Нет доступных заказов.</p>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;

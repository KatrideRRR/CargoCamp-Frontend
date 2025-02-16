import React, { useState, useEffect } from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';
import '../styles/OrdersPage.css';
import axiosInstance from "../utils/axiosInstance";
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const MyOrdersPage = () => {
    const { userId } = useParams(); // Получаем ID пользователя из URL
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {

        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`http://localhost:5000/api/orders/creator/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const ordersData = response.data;

                // Запрашиваем пользователей, запросивших каждый заказ
                const ordersWithExecutors = await Promise.all(
                    ordersData.map(async (order) => {
                        try {
                            const executorsResponse = await axios.get(
                                `http://localhost:5000/api/orders/${order.id}/requested-executors`,
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            return { ...order, requestedExecutors: executorsResponse.data };
                        } catch (error) {
                            console.error(`Ошибка загрузки исполнителей для заказа ${order.id}:`, error);
                            return { ...order, requestedExecutors: [] };
                        }
                    })
                );

                setOrders(ordersWithExecutors);
            } catch (err) {
                console.error('Ошибка при загрузке заказов:', err);
                setError('Ошибка при загрузке заказов.');
            } finally {
                setLoading(false);
            }
        };


        // Проверяем, совпадает ли userId с ID авторизованного пользователя
        const checkAuthUser = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (profileResponse.data.id !== Number(userId)) {
                    navigate('/'); // Перенаправляем, если пользователь пытается зайти в чужие заказы
                } else {
                    fetchOrders();
                }
            } catch (err) {
                console.error('Ошибка проверки пользователя:', err);
                navigate('/login');
            }
        };

        checkAuthUser();

        socket.on('orderUpdated', fetchOrders);
        return () => {
            socket.off('orderUpdated', fetchOrders);
        };
    }, [userId, navigate]);


    const approveExecutor = async (orderId, executorId) => {
        try {
            await axiosInstance.post(`/orders/${orderId}/approve`, { executorId });
            alert('Исполнитель одобрен!');
        } catch (error) {
            console.error('Ошибка при одобрении исполнителя:', error);
            alert('Не удалось одобрить исполнителя');
        }
    };
    return (
        <div className="container">
            <div className="orders-wrapper">
                <Link to={`/create-order`} className="create-button">
                   Разместить заказ</Link>

                {orders.length > 0 ? (
                    <ul className="orders-list">
                        {orders.map((order) => {
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
                                            <p>
                                                <strong>Категория:</strong> {order.category ? order.category.name : 'Не указано'}
                                            </p>
                                            <p>
                                                <strong>Подкатегория:</strong> {order.subcategory ? order.subcategory.name : 'Не указано'}
                                            </p>
                                            <p><strong>Описание:</strong> {order.description}</p>
                                            <p><strong>Адрес:</strong> {order.address}</p>
                                            <p><strong>Цена:</strong> {order.proposedSum} ₽</p>
                                            {Array.isArray(order.requestedExecutors) && order.requestedExecutors.length > 0 ? (
                                                <div className="executors-list">
                                                    <strong>Исполнители, запросившие заказ:</strong>
                                                    <ul>
                                                        {order.requestedExecutors.map((executor) => (
                                                            <li key={executor.id}>
                                                                {executor.username} {executor.id} (Рейтинг: {executor.rating || 'Нет'} ⭐,
                                                                Оценок: {executor.ratingCount || 0})
                                                                <button onClick={() => approveExecutor(order.id, executor.id)}>Одобрить</button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <p>Нет запросов на выполнение</p>
                                            )}


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

export default MyOrdersPage;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import '../styles/OrdersPage.css'; // Импорт стилей

const ActiveOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, ] = useState(null); // Состояние для ошибок
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Вы не авторизованы! Пожалуйста, войдите в систему.');
            navigate('/login');
        }
        const fetchActiveOrders = async () => {
            const token = localStorage.getItem('authToken'); // Получение токена
            try {
                const response = await axios.get('http://localhost:5000/api/orders/active-orders', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(response.data); // Сохранение заказов в состоянии
            } catch (err) {
                console.error('Ошибка при загрузке активных заказов:', err);
            }
        };

        fetchActiveOrders();
    }, [navigate]);

    const handleCompleteOrder = async (orderId) => {
        const token = localStorage.getItem('authToken');
        try {
            await axios.post(
                `http://localhost:5000/api/orders/${orderId}/complete`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Заказ завершен!');
            setOrders(orders.filter((order) => order.id !== orderId));
        } catch (err) {
            console.error('Ошибка при завершении заказа:', err);
            alert('Не удалось завершить заказ.');
        }
    };


    if (error) {
        return <div className="error-message">{error}</div>; // Отображение ошибки
    }

    return (
        <div className="orders-container">
            <div className="orders-wrapper">
                {orders.length > 0 ? (
                    <ul className="orders-list">
                        {orders.map((order) => (
                            <li key={order.id} className="order-card">
                                <p className="order-type"><strong>Тип заказа:</strong> {order.type}</p>
                                <p className="order-description"><strong>Описание:</strong> {order.description}</p>
                                <p className="order-status"><strong>Адрес:</strong> {order.address}</p>
                                <p className="order-proposedSum"><strong>Цена:</strong> {order.proposedSum} ₽</p>
                                <div className="action-buttons">
                                    <button
                                        className="call-button"
                                        onClick={() => window.open(`tel:${order.phone}`)}
                                    >
                                        Позвонить
                                    </button>
                                    <button className="message-button">Сообщение</button>
                                    <button className="route-button">Маршрут</button>
                                    <button
                                        className="complete-button"
                                        onClick={() => handleCompleteOrder(order.id)}
                                    >
                                        Завершить
                                    </button>
                                </div>
                            </li>

                        ))}
                    </ul>
                ) : (
                    <p className="no-orders">Нет активных заказов.</p> // Сообщение, если заказов нет
                )}
            </div>
        </div>
    );
};

export default ActiveOrdersPage;

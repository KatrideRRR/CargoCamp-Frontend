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

    if (error) {
        return <div className="error-message">{error}</div>; // Отображение ошибки
    }

    return (
        <div className="orders-container">
            <div className="orders-wrapper">
                <h1 className="page-title">Ваши активные заказы</h1>
                {orders.length > 0 ? (
                    <ul className="orders-list">
                        {orders.map((order) => (
                            <li key={order.id} className="order-card">
                                <p className="order-description"><strong>Описание:</strong> {order.description}</p>
                                <p className="order-status"><strong>Адрес:</strong> {order.address}</p>
                                <button className="take-order-button">Завершить заказ</button>
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

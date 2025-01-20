import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import '../styles/OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get('/orders/all');
                setOrders(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки заказов');
            }
        };

            fetchOrders();

    }, []);

    const handleTakeOrder = async (orderId) => {
        try {
            await axiosInstance.post(`/orders/${orderId}/take`);
            alert("Заказ взят в работу!");
            navigate('/active-orders'); // Перенаправляем пользователя
        } catch (error) {
            console.error("Ошибка при взятии заказа:", error);
            alert(error.response?.data?.message || "Не удалось взять заказ");
        }
    };


    if (error) {
        return <div className="error-message">Ошибка: {error}</div>;
    }



    return (
        <div className="orders-container">
            <div className="orders-wrapper">
                <h1 className="page-title">Доступные заказы</h1>
                {orders.length > 0 ? (
                    <ul className="orders-list">
                        {orders.map((order) => (
                            <li className="order-card" key={order.id}>
                                <p className="order-description"><strong>Описание:</strong> {order.description}</p>
                                <p className="order-address"><strong>Адрес:</strong> {order.address}</p>
                                <p className="order-proposedSum"><strong>Цена:</strong> {order.proposedSum} ₽</p>
                                <button
                                    className="take-order-button"
                                    onClick={() => handleTakeOrder(order.id)}
                                >
                                    Взять в работу
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-orders">Нет доступных заказов.</p> // Сообщение, если заказов нет
                )}
            </div>
        </div>
    );

};

export default OrdersPage;

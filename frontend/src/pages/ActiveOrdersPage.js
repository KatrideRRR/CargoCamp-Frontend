import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/OrdersPage.css'; // Импорт стилей

const ActiveOrdersPage = () => {
    const [activeOrders, setActiveOrders] = useState([]); // Состояние для хранения активных заказов
    const [error, setError] = useState(null); // Состояние для ошибок

    useEffect(() => {
        const fetchActiveOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/orders/active-orders');
                setActiveOrders(response.data); // Сохраняем данные в состоянии
            } catch (error) {
                console.error('Ошибка при загрузке активных заказов:', error);
                setError('Не удалось загрузить активные заказы.'); // Устанавливаем сообщение об ошибке
            }
        };

        fetchActiveOrders();
    }, []);

    if (error) {
        return <div className="error-message">{error}</div>; // Отображение ошибки
    }

    return (
        <div className="orders-container">
            <div className="orders-wrapper">
                <h1 className="page-title">Ваши активные заказы</h1>
                {activeOrders.length > 0 ? (
                    <ul className="orders-list">
                        {activeOrders.map((order) => (
                            <li key={order.id} className="order-card">
                                <p className="order-description"><strong>Описание:</strong> {order.description}</p>
                                <p className="order-status"><strong>Адрес:</strong> {order.address}</p>
                                <button className="take-order-button">Взять в работу</button>
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

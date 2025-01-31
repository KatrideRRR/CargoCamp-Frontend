import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import '../styles/OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null); // Сохраняем ID текущего пользователя
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get('/orders/all');
                setOrders(response.data);
                console.log(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки заказов');
            }
        };
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/auth/profile'); // Предполагаем, что этот запрос возвращает текущего пользователя
                setUserId(response.data.id);
            } catch (err) {
                console.error("Ошибка получения профиля:", err);
            }
        };

        fetchOrders();
        fetchUserData();
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
                {orders.length > 0 ? (
                    <ul className="orders-list">
                        {orders.map((order) => (
                            <li className="order-card" key={order.id}>
                                <div className="order-content">
                                    <div className="order-left">
                                        <p className="order-type"><strong>Тип заказа:</strong> {order.type}</p>
                                        <p className="order-description"><strong>Описание:</strong> {order.description}</p>
                                        <p className="order-address"><strong>Адрес:</strong> {order.address}</p>
                                        <p className="order-proposedSum"><strong>Цена:</strong> {order.proposedSum} ₽</p>
                                        <p><strong>ID создателя:</strong> {order.creatorId}</p>
                                    </div>
                                    {order.photoUrl && (<img src={`http://localhost:5000${order.photoUrl}`} alt="Фото заказа" className="order-photo"/>)}

                                </div>{userId !== order.creatorId && (<button className="take-order-button" onClick={() => handleTakeOrder(order.id)}>Взять в работу</button>
                                )}
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

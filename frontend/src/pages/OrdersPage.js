import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import '../styles/OrdersPage.css';
import io from 'socket.io-client';
import { ModalContext } from '../utils/modalContext';

const socket = io('http://localhost:5000');

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const { openModal, closeModal } = useContext(ModalContext);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get('/orders/all');
                console.log("📦 Загружены заказы:", response.data);
                setOrders(response.data);
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

    const handleApproveOrder = async (orderId) => {
        try {
            await axiosInstance.post(`/orders/${orderId}/approve`);
            closeModal();
            navigate('/active-orders');
        } catch (error) {
            console.error("❌ Ошибка при одобрении заказа:", error);
            alert(error.response?.data?.message || "Не удалось одобрить заказ");
        }
    };

    const handleRejectOrder = async (orderId) => {
        try {
            await axiosInstance.post(`/orders/${orderId}/reject`);
            closeModal();
        } catch (error) {
            console.error("Ошибка при отклонении исполнителя:", error);
            alert(error.response?.data?.message || "Не удалось отклонить исполнителя");
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

                                </div>
                                {userId !== order.creatorId && !order.executorId && order.status === 'pending' && (
                                    <button className="take-order-button" onClick={() => handleRequestOrder(order.id)}>Запросить выполнение</button>
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

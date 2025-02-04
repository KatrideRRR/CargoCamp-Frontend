import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import '../styles/OrdersPage.css';
import io from 'socket.io-client';
import Modal from '../components/Modal'; // Импортируем модальное окно

const socket = io('http://localhost:5000'); // Подключаем WebSocket

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null); // Сохраняем ID текущего пользователя
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(null); // Данные о запросе

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get('/orders/all');
                console.log("📦 Загружены заказы:", response.data);
                setOrders(response.data);
                console.log(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки заказов');
            }
        };
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/auth/profile'); // Предполагаем, что этот запрос возвращает текущего пользователя
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

            const handleOrderRequested = (data) => {
                console.log("🔔 Получен запрос на заказ:", data);

                if (data.creatorId === userId) {
                    setPendingRequest(data);
                    setModalOpen(true);
                }
            };
            const handleApproveOrder = (data) => {
                console.log("✅ Заказ одобрен через WebSocket:", data);

                alert(`✅ ${data.message}`);
            };


            socket.on('orderApproved', handleApproveOrder);
            socket.on('orderUpdated', fetchOrders);
            socket.on('orderRequested', handleOrderRequested);

            return () => {
                socket.off('orderUpdated', fetchOrders);
                socket.off('orderRequested', handleOrderRequested);
                socket.off('orderApproved', handleApproveOrder);
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
            console.log("🚀 Отправляем запрос на одобрение заказа:", orderId);
            await axiosInstance.post(`/orders/${orderId}/approve`);
            setModalOpen(false);
            setPendingRequest(null);
            navigate('/active-orders');
        } catch (error) {
            console.error("❌ Ошибка при одобрении заказа:", error);
            alert(error.response?.data?.message || "Не удалось одобрить заказ");
        }
    };

    const handleRejectOrder = async (orderId) => {
        try {
            await axiosInstance.post(`/orders/${orderId}/reject`);
            setModalOpen(false);
            setPendingRequest(null);
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

                                </div>{userId !== order.creatorId && !order.executorId && order.status === 'pending' && (
                                <button className="take-order-button" onClick={() => handleRequestOrder(order.id)}>Запросить выполнение</button>
                            )}
                                {userId === order.creatorId && order.executorId && order.status === 'pending' && (
                                    <>
                                        <button className="approve-button" onClick={() => handleApproveOrder(order.id)}>Одобрить</button>
                                        <button className="reject-button" onClick={() => handleRejectOrder(order.id)}>Отклонить</button>
                                    </>
                                )}


                            </li>

                        ))}
                    </ul>
                ) : (
                    <p className="no-orders">Нет доступных заказов.</p> // Сообщение, если заказов нет
                )}
            </div>

            {/* Модальное окно */}
            {modalOpen && pendingRequest && (
                <Modal onClose={() => setModalOpen(false)}>
                    <h2>Запрос на выполнение заказа</h2>
                    <p><strong>Исполнитель:</strong> {pendingRequest.executorId}</p>
                    <button className="approve-button" onClick={() => handleApproveOrder(pendingRequest.orderId)}>Одобрить</button>
                    <button className="reject-button" onClick={() => handleRejectOrder(pendingRequest.orderId)}>Отклонить</button>
                </Modal>
            )}
        </div>
    );
};

export default OrdersPage;

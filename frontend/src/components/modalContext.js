import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom'; // Используем useNavigate
import '../styles/modalContext.css'

export const ModalContext = createContext();

const socket = io('http://localhost:5000'); // Подключаем WebSocket

export const ModalProvider = ({ children }) => {
    const [modalData, setModalData] = useState(null);
    const [userId, setUserId] = useState(null);
    const [notificationData, setNotificationData] = useState(null); // Для уведомлений исполнителю
    const [completionNotificationData, setCompletionNotificationData] = useState(null); // Уведомление по завершению заказа
    const navigate = useNavigate(); // Используем navigate для переходов

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/auth/profile');
                setUserId(response.data.id);
                socket.emit('register', response.data.id); // Регистрация пользователя на сокете
            } catch (error) {
                console.error("❌ Ошибка загрузки профиля:", error);
            }
        };

        fetchUserData();

        const fetchExecutorData = async (executorId) => {
            try {
                const response = await axiosInstance.get(`/auth/${executorId}`);
                return response.data;
            } catch (error) {
                console.error("❌ Ошибка загрузки данных исполнителя:", error);
                return null;
            }
        };

        if (userId) {
            console.log("🔄 Подключаем WebSocket для пользователя:", userId);

            // Слушаем события для заказчика
            socket.on('orderRequested', async (data) => {
                console.log("🔔 Получен запрос на выполнение заказа:", data);

                if (data.creatorId === userId) {
                    const executorInfo = await fetchExecutorData(data.executorId);

                    if (executorInfo) {
                        setModalData({
                            title: "Запрос на выполнение заказа",
                            description: `Пользователь ${executorInfo.username} хочет выполнить ваш заказ. 
                              📊 Рейтинг: ${executorInfo.rating || "Нет данных"} ⭐
                              🚨 Жалобы: ${executorInfo.complaintsCount || 0}
                              Номер заказа: ${data.orderId}`,
                            onConfirm: () => handleApproveOrder(data.orderId),
                            onCancel: () => handleRejectOrder(data.orderId),
                            executorId: executorInfo.id, // Добавляем ID исполнителя для перехода на страницу жалоб
                            orderId: data.orderId // Сохраняем ID заказа
                        });
                    }
                }
            });

            // Слушаем уведомления для исполнителя
            socket.on('orderApproved', (data) => {
                console.log("🔔 Заказ одобрен:", data);
                if (data.message.includes("Ваш запрос")) {
                    setNotificationData({
                        title: "Ваш запрос одобрен!",
                        description: `Заказ номер ${data.orderId}: ${data.message}`,
                        onClose: () => setNotificationData(null),
                    });
                }
            });

            // Слушаем уведомления о завершении заказа
            socket.on('orderCompleted', (data) => {
                console.log("🔔 Уведомление о завершении заказа:", data);

                if (data.message) {
                    setCompletionNotificationData({
                        title: "Ожидание завершения заказа",
                        description: `Заказ номер ${data.orderId}: ${data.message}`,
                        onClose: () => setCompletionNotificationData(null),
                    });
                }
            });

            return () => {
                socket.off('orderRequested');
                socket.off('orderApproved');
                socket.off('orderCompleted');
            };
        }
    }, [userId]);

    const openModal = (data) => {
        setModalData(data);
    };

    const closeModal = () => {
        setModalData(null);
    };

    const handleApproveOrder = async (orderId) => {
        try {
            await axiosInstance.post(`/orders/${orderId}/approve`);
            closeModal();
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

    const handleGoToComplaints = (executorId, orderId) => {
        // Используем navigate для перехода
        navigate(`/complaints/${executorId}?orderId=${orderId}`);
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}

            {/* Основное модальное окно */}
            {modalData && (
                <div className="modal-overlay">

                    <div className="modal">
                        <h2>{modalData.title}</h2>
                        <p>{modalData.description}</p>
                        <button onClick={modalData.onConfirm}>Одобрить</button>
                        <button onClick={modalData.onCancel}>Отклонить</button>

                        {/* Кнопка для перехода к жалобам на исполнителя */}
                        {modalData.executorId && (
                            <button onClick={() => handleGoToComplaints(modalData.executorId, modalData.orderId)}>
                                Перейти к жалобам на исполнителя
                            </button>
                        )}
                    </div>

                </div>
                    )}

                    {/* Уведомление для исполнителя в виде модала */}
                    {notificationData && (
                        <div className="modal-overlay">

                            <div className="modal">
                                <h2>{notificationData.title}</h2>
                                <p>{notificationData.description}</p>
                                <button onClick={notificationData.onClose}>Закрыть</button>
                            </div>
                        </div>

                    )}

                            {/* Уведомление о завершении заказа */}
                            {completionNotificationData && (
                                <div className="modal-overlay">

                                    <div className="modal">
                                        <h2>{completionNotificationData.title}</h2>
                                        <p>{completionNotificationData.description}</p>
                                        <button onClick={completionNotificationData.onClose}>Закрыть</button>
                                    </div>
                                </div>

                            )}
        </ModalContext.Provider>
                    );
                    };

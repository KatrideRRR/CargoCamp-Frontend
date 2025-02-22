import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function MessagesPage() {
    const { orderId } = useParams(); // Получаем ID заказа из URL
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Запрос на сервер для получения сообщений для конкретного заказа
        axios.get(`http://localhost:5000/api/admin/${orderId}/messages`)
            .then(response => setMessages(response.data))
            .catch(error => console.error("Ошибка загрузки сообщений:", error));
    }, [orderId]); // Загрузка сообщений при изменении orderId

    return (
        <div>
            <h2>Переписки по заказу #{orderId}</h2>
            <ul>
                {messages.length > 0 ? (
                    messages.map(msg => (
                        <li key={msg.id}>
                            <strong>{msg.sender.username}: </strong> {msg.content}
                            <div><small>{new Date(msg.createdAt).toLocaleString()}</small></div>
                        </li>
                    ))
                ) : (
                    <p>Сообщения не найдены.</p>
                )}
            </ul>
        </div>
    );
}

export default MessagesPage;

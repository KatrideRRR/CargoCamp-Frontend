import React, { useEffect, useState } from "react";
import axios from "axios";

function MessagesPage() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/admin/messages")
            .then(response => setMessages(response.data))
            .catch(error => console.error("Ошибка загрузки сообщений:", error));
    }, []);

    return (
        <div>
            <h2>Переписки</h2>
            <ul>
                {messages.map(msg => (
                    <li key={msg.id}>
                        <strong>{msg.sender}: </strong> {msg.text}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MessagesPage;

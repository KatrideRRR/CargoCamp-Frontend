import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/UserComplaintsPage.css"; // Подключаем стили

function UserComplaintsPage() {
    const { userId } = useParams(); // Получаем ID пользователя из URL
    const [complaints, setComplaints] = useState([]);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        axios.get(`http://localhost:5000/api/admin/users/${userId}/complaints`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                setUsername(response.data.username);
                setComplaints(response.data.complaints || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка загрузки жалоб", error);
                setError("Не удалось загрузить жалобы");
                setLoading(false);
            });
    }, [userId, token]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="complaints-container">
            <h1>Жалобы на {username} (ID: {userId})</h1>

            {complaints.length === 0 ? (
                <p>На этого пользователя нет жалоб.</p>
            ) : (
                <ul className="complaints-list">
                    {complaints.map((complaint, index) => (
                        <li key={index} className="complaint-item">{complaint}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UserComplaintsPage;

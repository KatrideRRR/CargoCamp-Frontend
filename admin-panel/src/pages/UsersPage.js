import React, { useEffect, useState } from "react";
import axios from "axios";

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // Поле для поиска
    const [filteredUsers, setFilteredUsers] = useState([]);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        axios.get("http://localhost:5000/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                setUsers(response.data);
                setFilteredUsers(response.data); // Изначально отображаем всех пользователей
            })
            .catch((error) => console.error("Ошибка загрузки пользователей", error));
    }, [token]);

    const blockUser = async (id) => {
        await axios.put(`http://localhost:5000/api/admin/users/${id}/block`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.map(user => user.id === id ? { ...user, role: "banned" } : user));
        setFilteredUsers(filteredUsers.map(user => user.id === id ? { ...user, role: "banned" } : user));
    };

    // Функция поиска пользователей
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query.trim() === "") {
            setFilteredUsers(users); // Если поле пустое, показываем всех
        } else {
            setFilteredUsers(users.filter(user =>
                user.id.toString().includes(query) || user.phone.includes(query)
            ));
        }
    };

    return (
        <div>
            <h1>Пользователи</h1>

            {/* Поле для поиска */}
            <input
                type="text"
                placeholder="Поиск по ID или номеру телефона"
                value={searchQuery}
                onChange={handleSearch}
            />

            <ul>
                {filteredUsers.map((user) => (
                    <li key={user.id}>
                        {user.id} {user.username} {user.phone} {user.createdAt} {user.updatedAt} {user.rating} {user.ratingCount} {user.complaintsCount}
                        {user.role !== "banned" && <button onClick={() => blockUser(user.id)}>Заблокировать</button>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UsersPage;

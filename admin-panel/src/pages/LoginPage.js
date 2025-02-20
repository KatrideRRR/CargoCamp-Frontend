import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/admin/login", {
                phone,
                password,
            });

            const { token, user } = response.data;

            // Сохраняем токен и роль
            localStorage.setItem("authToken", token);
            localStorage.setItem("userRole", user.role);

            // Перенаправление на панель администрирования
            navigate("/dashboard");
        } catch (err) {
            setError("Неверный логин или пароль.");
        }
    };


    return (
        <div>
            <h2>Вход для администратора</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input type="phone" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Войти</button>
            </form>
        </div>
    );
}

export default LoginPage;

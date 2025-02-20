import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
    return (
        <div>
            <h1>Панель администратора</h1>
            <nav>
                <ul>
                    <li><Link to="/users">Пользователи</Link></li>
                    <li><Link to="/orders">Заказы</Link></li>
                </ul>
            </nav>
        </div>
    );
}

export default Dashboard;

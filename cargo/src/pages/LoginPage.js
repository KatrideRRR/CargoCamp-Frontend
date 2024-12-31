import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Здесь добавьте логику авторизации через API
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/profile');
  }



    // Пример аутентификации
    const mockUser = { email: 'user@example.com', role: 'customer' };
    if (email === mockUser.email && password === 'password') {
      localStorage.setItem('user', JSON.stringify(mockUser));
      navigate('/profile');
    } else {
      alert('Неверный логин или пароль');
    }
  

  return (
    <div>
      <div style={{ paddingTop: '30px' }}></div>
      <h1>Авторизация</h1>
      <input
        type="email"
        placeholder="Почта"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Войти</button>
      <p>
        Нет аккаунта? <a href="/register">Зарегистрироваться</a>
      </p>
    </div>
  );
};

export default LoginPage;

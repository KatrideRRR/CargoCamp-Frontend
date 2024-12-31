import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    phone: '',
    email: '',
  });

  const handleRegister = () => {
    // Здесь добавьте логику регистрации через API
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/profile');
  };

  return (
    <div>
      <div style={{ paddingTop: '30px' }}></div>
      <h1>Регистрация</h1>
      <input
        type="text"
        placeholder="Имя"
        value={form.firstName}
        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Фамилия"
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Отчество"
        value={form.patronymic}
        onChange={(e) => setForm({ ...form, patronymic: e.target.value })}
      />
      <input
        type="text"
        placeholder="Телефон"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        type="email"
        placeholder="Почта"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <button onClick={handleRegister}>Зарегистрироваться</button>
    </div>
  );
};

export default RegisterPage;

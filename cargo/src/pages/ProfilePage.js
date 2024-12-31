import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const ProfilePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; // Пример проверки

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Пока перенаправление происходит, ничего не рендерим
  }

  return (
    <div>
      <div style={{ paddingTop: '30px' }}></div>
      <h1>Ваш профиль</h1>
      <p>Добро пожаловать в ваш профиль!</p>
    </div>
  );
};


export default ProfilePage;

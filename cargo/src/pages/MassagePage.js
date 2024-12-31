import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MassagePage.css';


const MassagePage = () => {
  // Пример данных чатов
  const chats = [
    { id: 1, name: 'Иван Иванов', lastMessage: 'Добрый день!', time: '14:32' },
    { id: 2, name: 'Ольга Петрова', lastMessage: 'Спасибо за заказ!', time: '13:20' },
    { id: 3, name: 'Компания "Грузоперевозки"', lastMessage: 'Заказ принят', time: '11:45' },
  ];

  return (
    <div className="massage-page">
      <div style={{ paddingTop: '30px' }}></div>
      <h1>Чаты</h1>
      <ul className="chat-list">
        {chats.map((chat) => (
          <li key={chat.id} className="chat-item">
            <Link to={`/massage/${chat.id}`} className="chat-link">
              <div className="chat-info">
                <h3>{chat.name}</h3>
                <p className="chat-last-massage">{chat.lastMassage}</p>
              </div>
              <p className="chat-time">{chat.time}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MassagePage;

import React, { useState } from 'react';
import { createOrder } from '../utils/api';

const CreateOrderPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrder({ title, description });
      setMessage('Заказ успешно создан!');
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      setMessage('Ошибка при создании заказа.');
    }
  };

  return (
    <div>
      <h1>Создать новый заказ</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Название:
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <br />
        <label>
          Описание:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <br />
        <button type="submit">Создать</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateOrderPage;


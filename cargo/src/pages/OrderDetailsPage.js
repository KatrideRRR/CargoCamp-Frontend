import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const orders = location.state.orders; // Получение данных из state

  const order = orders.find(order => order.id === parseInt(id));

  // Пример данных о заказе (в реальном приложении данные могут загружаться из API)
  const orderDetails = {
    id: id,
    title: `Детали заказа ${id}`,
    description: `Описание заказа ${id}`,
    status: 'В процессе',
  };

  if (!order) {
    return <h1>Заказ не найден</h1>;
  }

  return (
    <div>
      <h1>{orderDetails.title}</h1>
      <p>{orderDetails.description}</p>
      <p>Status: {orderDetails.status}</p>
    </div>
  );
};

export default OrderDetailsPage;


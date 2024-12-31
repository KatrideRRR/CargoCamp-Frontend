import React, { useEffect, useState } from 'react';
import { fetchOrders } from '../utils/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <p>Загрузка заказов...</p>;
  }

  return (
    <div>
      <h1>Список заказов</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <h3>{order.title}</h3>
            <p>{order.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;


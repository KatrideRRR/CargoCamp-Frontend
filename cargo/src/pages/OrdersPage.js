import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { fetchOrders } from '../utils/api';


const OrdersPage = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await API.get('/orders');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div>
            <div style={{paddingTop: '30px'}}></div>
            <h1>Orders</h1>
            <ul>
                {orders.map((order) => (
                    <li key={order.id}>
                        {order.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrdersPage;
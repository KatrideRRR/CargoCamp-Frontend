import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/main.css';
import 'leaflet/dist/leaflet.css';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import Navbar from './components/Navbar';
import SpecialOrdersPage from './pages/SpecialOrdersPage';
import ActiveOrdersPage from './pages/ActivateOrdersPage';
import BottomMenu from './components/BottomMenu';
import ChatDetailsPage from './pages/ChatDetailsPage';
import MassagePage from './pages/MassagePage';




const App = () => {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/massage" element={<MassagePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/special-orders" element={<SpecialOrdersPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/active-orders" element={<ActiveOrdersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/create-order" element={<CreateOrderPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/massage/:id" element={<ChatDetailsPage />} />
      </Routes>
      <BottomMenu />
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

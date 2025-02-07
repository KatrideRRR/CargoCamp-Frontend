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
import Navbar from './components/Navbar';
import SpecialOrdersPage from './pages/SpecialOrdersPage';
import ActiveOrdersPage from './pages/ActiveOrdersPage';
import BottomMenu from './components/BottomMenu';
import ChatPage from './pages/ChatPage';
import { AuthProvider } from "./utils/authContext";
import { UserProvider } from './utils/userContext';
import { ModalProvider } from './utils/modalContext';
import Modal from './components/Modal';
import UserComplaintsPage from './components/UserComplaintsPage';
import OrderHistoryPage from "./pages/OrderHistoryPage";

const App = () => {
    return (
        <ModalProvider>
        <AuthProvider>
            <UserProvider>
                    <Router>
                        <Navbar />
                        <Modal />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/massage" element={<ChatPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/profile" element={<ProfilePage />}/>
                            <Route path="/complaints/:userId" element={<UserComplaintsPage />} />
                            <Route path="/special-orders" element={<SpecialOrdersPage />} />
                            <Route path="/active-orders" element={<ActiveOrdersPage />}/>
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/orders-history/:userId" element={<OrderHistoryPage />} />
                            <Route path="/create-order" element={<CreateOrderPage />} />
                            <Route path="/messages/:orderId" element={<ChatPage/>} />
                        </Routes>
                        <BottomMenu />
                    </Router>
            </UserProvider>
        </AuthProvider>
        </ModalProvider>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

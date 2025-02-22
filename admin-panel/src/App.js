import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import OrdersPage from "./pages/OrdersPage";
import PrivateRoute from "./components/PrivateRoute";
import MessagesPage from "./pages/MessagesPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import UserComplaintsPage from "./pages/UserComplaintsPage";
import UserOrdersPage from "./pages/UserOrdersPage";
import AdminCreateOrderPage from "./pages/AdminCreateOrderPage";
import CreateUserPage from "./pages/CreateUserPage";

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/create-user" element={<PrivateRoute><CreateUserPage /></PrivateRoute>} />
              <Route path="/" element={<PrivateRoute><LoginPage /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
              <Route path="/:orderId/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
              <Route path="/orders/:id" element={<PrivateRoute><OrderDetailsPage /></PrivateRoute>} />
              <Route path="/users/:userId/complaints" element={<PrivateRoute><UserComplaintsPage /></PrivateRoute>} />
              <Route path="/users/:userId/orders" element={<PrivateRoute><UserOrdersPage /></PrivateRoute>} />
              <Route path="/create" element={<PrivateRoute><AdminCreateOrderPage /></PrivateRoute>} />
          </Routes>
      </Router>
  );
}

export default App;

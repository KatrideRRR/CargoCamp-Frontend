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

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
              <Route path="/orders/:id" element={<PrivateRoute><OrderDetailsPage /></PrivateRoute>} />
              <Route path="/users/:userId/complaints" element={<PrivateRoute><UserComplaintsPage /></PrivateRoute>} />
          </Routes>
      </Router>
  );
}

export default App;

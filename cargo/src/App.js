import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import BottomMenu from './components/BottomMenu';
import HomePage from './HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
// ...
<Router>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/messages" element={<MessagesPage />} />
  </Routes>
  <BottomMenu />
</Router>

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
    </Router>
  );
};

export default App;
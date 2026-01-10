import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing/Landing';
import Events from './pages/Events/Events';
import Marketplace from './pages/Marketplace/Marketplace';
import Chat from './pages/Chat/index';
import Map from './pages/Map/Map';
import Profile from './pages/Profile/Profile';
import Registration from './pages/Registration/Registration';
import SellerDashboard from './pages/SellerDashboard/SellerDashboard';
import EventDashboard from './pages/EventDashboard/EventDashboard';
import MyOrders from './pages/MyOrders/MyOrders';
import './styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/events" element={<Events />} />
            <Route path="/market" element={<Marketplace type="market" />} />
            <Route path="/willing" element={<Marketplace type="willing" />} />
            <Route path="/barther-trade" element={<Marketplace type="barter" />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/map" element={<Map />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/event-dashboard" element={<EventDashboard />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

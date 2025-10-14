import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing/Landing';
import Events from './pages/Events/Events';
import Market from './pages/Market/Market';
import Willing from './pages/Willing/Willing';
import BarterTrade from './pages/BarterTrade/BarterTrade';
import Chat from './pages/Chat/index';
import Map from './pages/Map/Map';
import Profile from './pages/Profile/Profile';
import SellerDashboard from './pages/SellerDashboard/SellerDashboard';
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
            <Route path="/market" element={<Market />} />
            <Route path="/willing" element={<Willing />} />
            <Route path="/barther-trade" element={<BarterTrade />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/map" element={<Map />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

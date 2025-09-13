import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Events from './pages/Events/Events';
import Market from './pages/Market/Market';
import MarketSimpleTest from './pages/Market/MarketSimpleTest';
import Willing from './pages/Willing/Willing';
import BarterTrade from './pages/BarterTrade/BarterTrade';
import Map from './pages/Map/Map';
import './styles/main.scss';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/events" element={<Events />} />
          <Route path="/market" element={<Market />} />
          <Route path="/market-test" element={<MarketSimpleTest />} />
          <Route path="/willing" element={<Willing />} />
          <Route path="/barther-trade" element={<BarterTrade />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

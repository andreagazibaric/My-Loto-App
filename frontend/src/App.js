import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import BuyTicket from './pages/BuyTicket';
import TicketView from './pages/TicketView';

function App() {
  return (
    <BrowserRouter >
      <NavBar />
      <div className='app-background' style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<BuyTicket />} />
          <Route path="/ticket/:uuid" element={<TicketView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

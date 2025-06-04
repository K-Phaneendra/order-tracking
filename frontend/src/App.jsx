import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import DeliveryPartners from './pages/admin/DeliveryPartners';
import Navbar from './components/Navbar';
import DeliveryPartnerOrders from './pages/deliveryPartner/DeliveryPartnerOrders';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/delivery-partners" element={<DeliveryPartners />} />
        <Route path="/delivery-partner/orders-to-deliver" element={<DeliveryPartnerOrders />} />
        {/* fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import VerifyOtp from './components/VerifyOtp';
import Login from './components/Login';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import RefundPolicy from './components/RefundPolicy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import VerifyOtp from './components/VerifyOtp';
import Login from './components/Login';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import RefundPolicy from './components/RefundPolicy';
import Interview from './components/Interview';
import Navbar from './components/Navbar';
import Placement from './components/Placement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyOtp />} />
        
        {/* Protected routes */}
        <Route path="/navbar" element={<Navbar />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ai-interview" element={<Interview />} />
          <Route path="placement" element={<Placement />} />
        </Route>
        
        {/* Public pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

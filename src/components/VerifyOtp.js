import React, { useState } from 'react';
import { verifyOtp } from '../api/auth';
import '../styles/LogReg.css'
import { useNavigate } from 'react-router-dom';

export default function VerifyOtp() {
  const [code, setCode] = useState('');
  const email = localStorage.getItem('email');
  const navigate = useNavigate();
  
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await verifyOtp(email, code);
      alert('Email verified successfully! Click ok and login');
      navigate('/login');

    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className='log-reg'>
    <form onSubmit={handleSubmit}>
      <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter OTP" required />
      <button type="submit">Verify OTP</button>
    </form>
    </div>
  );
}

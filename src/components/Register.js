import React, { useState, useEffect } from 'react';
import { registerUser, verifyOtp } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/LogReg.css';
import { Eye, EyeOff } from 'lucide-react';

export default function Register({ onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [form, touched]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (touched.name && !form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (touched.name && form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (touched.email && !form.email) {
      newErrors.email = 'Email is required';
    } else if (touched.email && !emailRegex.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (touched.phone && !form.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (touched.phone && !phoneRegex.test(form.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (touched.college && !form.college.trim()) {
      newErrors.college = 'College name is required';
    } else if (touched.college && form.college.trim().length < 3) {
      newErrors.college = 'College name is too short';
    }

    if (touched.password && !form.password) {
      newErrors.password = 'Password is required';
    } else if (touched.password && !passwordRegex.test(form.password)) {
      newErrors.password = 'Min 8 chars, uppercase, lowercase, number, special char';
    }

    if (touched.confirmPassword && !form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (touched.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = name === 'phone' ? value.replace(/[^\d]/g, '').slice(0, 10) : value;

    setForm({ ...form, [name]: cleanedValue });
    setTouched({ ...touched, [name]: true });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError('');

    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validateForm()) return;

    try {
      const { confirmPassword, ...userData } = form;
      await registerUser(userData);
      localStorage.setItem('email', form.email);
      setShowOtpModal(true);
    } catch (err) {
      setRegistrationError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');

    try {
      await verifyOtp(form.email, otpCode);
      setOtpSuccess('Email verified successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        setShowOtpModal(false);
        onClose();
        navigate('/');
      }, 2000);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="register-containers">
      <div className="register-form-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Enter your details to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
          <div className={`input-container ${errors.name ? 'error' : ''}`}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          {touched.name && errors.name && <span className="error-message">{errors.name}</span>}

          <div className={`input-container ${errors.email ? 'error' : ''}`}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          {touched.email && errors.email && <span className="error-message">{errors.email}</span>}

          <div className={`input-container ${errors.phone ? 'error' : ''}`}>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          {touched.phone && errors.phone && <span className="error-message">{errors.phone}</span>}

          <div className={`input-container ${errors.college ? 'error' : ''}`}>
            <input
              type="text"
              name="college"
              placeholder="College Name"
              value={form.college}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          {touched.college && errors.college && <span className="error-message">{errors.college}</span>}

          <div className={`input-container ${errors.password ? 'error' : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {touched.password && errors.password && <span className="error-message">{errors.password}</span>}

          <div className={`input-container ${errors.confirmPassword ? 'error' : ''}`}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="register-button"
              disabled={Object.keys(errors).length > 0}
            >
              Register
            </button>
          </div>

          {registrationError && (
            <div className="error-message server-error">
              {registrationError}
            </div>
          )}
        </form>
      </div>

      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal-content">
            <h2>Verify OTP</h2>
            <p className="otp-instructions">Check your email for the OTP</p>
            
            {otpSuccess && (
              <div className="success-message">{otpSuccess}</div>
            )}
            
            {otpError && (
              <div className="error-message">{otpError}</div>
            )}

            <form onSubmit={handleOtpSubmit}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value);
                  setOtpError('');
                }}
                required
              />
              <div className="otp-buttons">
                <button type="submit" className="verify-button">
                  Verify OTP
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

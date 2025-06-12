import React, { useState, useEffect } from 'react';
import { registerUser, verifyOtp } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, XCircle, Shield } from 'lucide-react';

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
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (!isRobotChecked) {
      setRegistrationError('Please confirm you are not a robot');
      return;
    }

    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { confirmPassword, ...userData } = form;
      await registerUser(userData);
      localStorage.setItem('email', form.email);
      setShowOtpModal(true);
    } catch (err) {
      setRegistrationError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
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
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
        <p className="text-slate-600">Join thousands of successful job seekers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter 10-digit phone number"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
            />
            {touched.phone && errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">College Name</label>
            <input
              type="text"
              name="college"
              placeholder="Enter your college name"
              value={form.college}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field ${errors.college ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
            />
            {touched.college && errors.college && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                {errors.college}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field pr-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <XCircle className="w-4 h-4 mr-1" />
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field pr-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <XCircle className="w-4 h-4 mr-1" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Robot Verification */}
        <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            id="robotCheck"
            checked={isRobotChecked}
            onChange={(e) => setIsRobotChecked(e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="robotCheck" className="text-sm font-medium text-slate-700 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-blue-600" />
            I'm not a robot
          </label>
        </div>

        <button
          type="submit"
          disabled={Object.keys(errors).length > 0 || !isRobotChecked || isSubmitting}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        {registrationError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 flex items-center">
              <XCircle className="w-4 h-4 mr-2" />
              {registrationError}
            </p>
          </div>
        )}
      </form>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
              <p className="text-slate-600">We've sent a verification code to your email</p>
            </div>
            
            {otpSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {otpSuccess}
                </p>
              </div>
            )}
            
            {otpError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  {otpError}
                </p>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setOtpError('');
                  }}
                  className="input-field text-center text-lg tracking-widest"
                  maxLength="6"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Verify Email
                </button>
                <button
                  type="button"
                  className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
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
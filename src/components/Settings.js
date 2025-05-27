import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';
import {
  updateUserProfile,
  changePassword,
  getBookedSlot,
} from '../api/auth';

// Validation functions
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) errors.push('At least 8 characters');
  if (!hasUpperCase) errors.push('One uppercase letter');
  if (!hasLowerCase) errors.push('One lowercase letter');
  if (!hasNumber) errors.push('One number');
  if (!hasSpecialChar) errors.push('One special character');

  return errors.length > 0 ? errors.join(', ') : null;
};

const validateName = (name) => {
  if (!name.trim()) return 'Name is required';
  if (name.length > 50) return 'Name too long (max 50 characters)';
  if (!/^[a-zA-Z ]+$/.test(name)) return 'Invalid characters in name';
  return null;
};

const validateCollege = (college) => {
  if (!college.trim()) return 'College is required';
  if (college.length > 100) return 'College name too long';
  return null;
};

export default function Settings({ user, closeModal, refreshUser }) {
  const [name, setName] = useState(user.name);
  const [college, setCollege] = useState(user.college || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [showTick, setShowTick] = useState({ name: false, college: false });
  const [errors, setErrors] = useState({
    name: '',
    college: '',
    password: '',
    confirm: ''
  });

   useEffect(() => {
    const fetchSlots = async () => {
      try {
        const { data } = await getBookedSlot(user.email);
        if (data) setBookedSlots(data);
      } catch {
        setBookedSlots([]);
      }
    };
    fetchSlots();
  }, [user.email]);

  const validateForm = () => {
    const newErrors = {
      name: validateName(name),
      college: validateCollege(college),
      password: '',
      confirm: ''
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleUpdate = async () => {
    setMessage('');
    if (!validateForm()) return;

    try {
      const response = await updateUserProfile({
        email: user.email,
        name: name.trim(),
        college: college.trim(),
      });

      if (response.data.success) {
        const updatedUser = {
          ...user,
          name: response.data.user.name,
          college: response.data.user.college,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        refreshUser();
        setMessage('Profile updated successfully ✔');
        setShowTick({ name: true, college: true });
        setTimeout(() => setShowTick({ name: false, college: false }), 2000);
      } else {
        setMessage(response.data.message || 'Update failed');
      }
    } catch {
      setMessage('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    setMessage('');
    const newErrors = {
      password: '',
      confirm: ''
    };

    // Basic validations
    if (!password) newErrors.password = 'Password is required';
    if (!confirmPassword) newErrors.confirm = 'Confirm password is required';
    if (password !== confirmPassword) newErrors.confirm = "Passwords don't match";
    
    // Password strength validation
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(prev => ({ ...prev, ...newErrors }));
    
    if (Object.values(newErrors).some(error => error)) return;

    try {
      const response = await changePassword({
        email: user.email,
        newPassword: password,
      });
      
      if (response.data.success) {
        setMessage('Password changed successfully ✔');
        setPassword('');
        setConfirmPassword('');
      } else {
        setMessage(response.data.message || 'Password change failed');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="settings-modal">
        <button className="close-btn" onClick={closeModal}>×</button>
        <h2>User Settings</h2>

        <div className="form-group">
          <label>Email</label>
          <input value={user.email} disabled />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input value={user.phone || ''} disabled />
        </div>

        <div className="form-group">
          <label>Name {showTick.name && <span className="tick">✔</span>}</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? 'error-input' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>College {showTick.college && <span className="tick">✔</span>}</label>
          <input
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="Enter your college name"
            className={errors.college ? 'error-input' : ''}
          />
          {errors.college && <span className="error-text">{errors.college}</span>}
        </div>

        <button onClick={handleUpdate} className="primary-btn">
          Update Profile
        </button>

        <hr />

        <h3>Change Password</h3>
       

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? 'error-input' : ''}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.confirm ? 'error-input' : ''}
          />
          {errors.confirm && <span className="error-text">{errors.confirm}</span>}
        </div>

        <button onClick={handlePasswordChange} className="primary-btn">
          Change Password
        </button>

        <div className={`message ${message.includes('✔') ? 'success' : 'error'}`}>
          {message}
        </div>

        <hr />

      {bookedSlots.length > 0 ? (
  <>
    <h4>Interview Booking Info</h4>
    {bookedSlots.map((slot, index) => (
      <div key={index} className="slot-info">
        <p><strong>Date:</strong> {new Date(slot.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> {slot.time}</p>
        <p><strong>Status:</strong> Booked</p>
        <hr />
      </div>
    ))}
  </>
) : (
  <p className="no-bookings">No booked slots found.</p>
)}


      </div>
    </div>
  );
}
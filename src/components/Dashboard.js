/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { getAvailableSlots, createOrder, verifyPayment, getBookedSlot } from '../api/auth';
import '../styles/Dashboard.css';
import 'react-datepicker/dist/react-datepicker.css';
import Sections from './Sections';
import Settings from './Settings';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const getISTDate = (date) => {
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + offset);
};

const getISTDateString = (date) => {
  return getISTDate(date).toISOString().split('T')[0];
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchBookedSlots(storedUser.email);
    }
    loadRazorpay();
    fetchAvailableSlots();
  }, []);

  const fetchUserData = () => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored) setUser(stored);
    fetchBookedSlots(stored.email);
  };

  const fetchBookedSlots = async (email) => {
    try {
      const { data } = await getBookedSlot(email);
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setBookedSlots(sorted);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
    }
  };

  const filterValidSlots = (slots) => {
    const now = new Date();
    const istNow = getISTDate(now);
    const todayStr = getISTDateString(now);

    return slots
      .filter(slot => {
        const slotDateStr = getISTDateString(new Date(slot.date));
        return slotDateStr >= todayStr;
      })
      .map(slot => {
        const slotDate = new Date(slot.date);
        const slotDateStr = getISTDateString(slotDate);
        const isToday = slotDateStr === todayStr;

        const updatedSlots = slot.slots.map((s) => {
          const slotTime = new Date(`${slot.date}T${s.time}`);
          const istSlotTime = getISTDate(slotTime);

          if (s.booked) {
            return { ...s, status: 'booked' };
          } else if (isToday && istSlotTime < istNow) {
            return { ...s, status: 'expired' };
          } else {
            return { ...s, status: 'available' };
          }
        });

        return { ...slot, slots: updatedSlots };
      });
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await getAvailableSlots();
      const filtered = filterValidSlots(response.data);
      setAvailableSlots(filtered);
      setFilteredSlots(filtered);
    } catch (err) {
      setError('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setError('');
    setSuccess('');
  };

  const handleSlotSelect = (time) => {
    setSelectedSlot(current => current === time ? null : time);
    setError('');
  };

  const handlePayment = async () => {
    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and time slot');
      return;
    }

    try {
      setLoading(true);
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) throw new Error('Razorpay failed to load');

      const amount = 49;
      const { data: order } = await createOrder(amount);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Interview Booking',
        description: `Booking for ${getISTDateString(selectedDate)} at ${selectedSlot}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const paymentData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userEmail: user.email,
              date: getISTDateString(selectedDate),
              time: selectedSlot
            };

            const { data } = await verifyPayment(paymentData);
            if (data.success) {
              const updatedUser = {
                ...user,
                interviewStatus: 'booked',
                interviewDate: getISTDateString(selectedDate),
                interviewTime: selectedSlot,
                paymentId: response.razorpay_payment_id
              };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              await fetchAvailableSlots();
              await fetchBookedSlots(user.email);
              setSuccess('Payment successful! Interview booked.');
              setSelectedDate(new Date());
              setSelectedSlot(null);
            }
          } catch (err) {
            setError('Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: () => setError('Payment cancelled refresh the page')
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  const getAvailableDates = () =>
    filteredSlots.map(slot => new Date(slot.date));

  const getSlotsForDate = (date) =>
    availableSlots.find(s => s.date === getISTDateString(date))?.slots || [];

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* Responsive Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            fresher<span>Sync</span>
          </div>
          
          <div className="navbar-menu">
            {/* Mobile menu button */}
            <button 
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="menu-icon-bar"></span>
              <span className="menu-icon-bar"></span>
              <span className="menu-icon-bar"></span>
            </button>
            
            {/* Navigation Links */}
            <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
              <a href="#booking" onClick={() => setMobileMenuOpen(false)}>
                
              </a>
              <a href="#booked-slots" onClick={() => setMobileMenuOpen(false)}>
                
              </a>
              <button 
                className="nav-settings-button"
                onClick={() => {
                  setShowSettings(true);
                  setMobileMenuOpen(false);
                }}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showSettings && (
        <Settings 
          user={user} 
          closeModal={() => setShowSettings(false)} 
          refreshUser={fetchUserData} 
        />
      )}

      <main className="main-content">
        <div className="booking-container" id="booking">
          <div className="calendar-section">
            <h2>Select Date</h2>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateSelect}
              includeDates={getAvailableDates()}
              inline
            />
            <div className="booking-instructions">
              <h3>Booking Process</h3>
              <ol>
                <li>Select date & choose available time slot</li>
                <li>Click "Pay<s>₹100</s> only ₹49" to complete booking</li>
                <li>Check email for confirmation</li>
              </ol>
              <div className="note-box">
                <strong>Important Note:</strong>
                <ul>
                  <li>Google Meet link shared 1 day before interview</li>
                  <li>For today's bookings: Link shared 1 hour prior</li>
                </ul>
              </div>
            </div>
          </div>

          {selectedDate && (
            <div className="slots-section">
              <h3>Available Time Slots for {selectedDate.toDateString()}</h3>
              <div className="slots-grid">
                {getSlotsForDate(selectedDate).map((slot, index) => {
                  const isSelected = selectedSlot === slot.time;
                  const status = slot.status;

                  return (
                    <button
                      key={index}
                      className={`time-slot ${isSelected ? 'selected' : ''} ${status}`}
                      onClick={() => status === 'available' && handleSlotSelect(slot.time)}
                      disabled={status !== 'available'}
                    >
                      {slot.time}
                      {status === 'expired' && <span className="expired-label">Expired</span>}
                      {status === 'booked' && <span className="booked-label">Booked</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedSlot && (
            <div className="payment-section">
              <button onClick={handlePayment} disabled={loading}>
                {loading ? 'Processing...' : `Pay ₹49 for ${selectedSlot}`}
              </button>
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
            </div>
          )}
        </div>

        {bookedSlots.length === 0 ? (
          <div className="booked-slots-section" id="booked-slots">
            <h2>Book Your First Interview</h2>
            <p>No interviews booked yet. Take the first step in your career journey - schedule your interview now!</p>
          </div>
        ) : (
          <div className="booked-slots-section" id="booked-slots">
            {new Date(`${bookedSlots[0].date}T${bookedSlots[0].time}`) > new Date() ? (
              <>
                <h2>Your Upcoming Interview</h2>
                <p><strong>Scheduled:</strong> {bookedSlots[0].date} at {bookedSlots[0].time}</p>
                <p className="reminder">Get ready for your upcoming interview! Make sure to prepare your materials in advance.</p>
              </>
            ) : (
              <>
                <h2>Your Last Booked Interview</h2>
                <p><strong>Last Attended:</strong> {bookedSlots[0].date} at {bookedSlots[0].time}</p>
              </>
            )}
          </div>
        )}
      </main>

      <Sections />
    </div>
  );
}
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import { getAvailableSlots } from '../api/auth';
import { FaArrowUp } from 'react-icons/fa';

const Sections = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await getAvailableSlots();
        const processedSlots = processSlots(response.data);
        setSlots(processedSlots);
        setLoading(false);
      } catch (err) {
        setError('Failed to load slots');
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  const processSlots = (backendSlots) => {
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return backendSlots
      .map(slot => {
        const slotDate = new Date(slot.date);
        const slotDay = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());

        if (slotDay < currentDate) return null;

        let validSlots = slot.slots;
        if (slotDay.getTime() === currentDate.getTime()) {
          validSlots = slot.slots.filter(timeSlot => {
            const [hours, minutes] = timeSlot.time.split(':');
            const slotTime = new Date(now);
            slotTime.setHours(hours, minutes, 0, 0);
            return slotTime > now;
          });
        }

        const openSlots = validSlots.filter(s => !s.booked).length;

        return {
          date: slotDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          day: slotDate.toLocaleDateString('en-US', { weekday: 'long' }),
          openSlots: openSlots,
          rawDate: slot.date
        };
      })
      .filter(slot => slot !== null && slot.openSlots > 0);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    { icon: "🎯", title: "Interview Ready", description: "Choose a date and time that fits your schedule" },
    { icon: "🔒", title: "Verified Process", description: "OTP-based email verification to keep things secure" },
    { icon: "💳", title: "Hassle-Free Payment", description: "Powered by Razorpay, safe and smooth" },
    { icon: "📩", title: "Instant Confirmation", description: "Get your interview link right in your inbox" },
    { icon: "🌐", title: "100% Online", description: "Attend interviews from anywhere, no travel needed" }
  ];

  const steps = [
    { number: "1", title: "Register & Verify", description: "Sign up and verify your email" },
    { number: "2", title: "Choose Your Slot", description: "Browse available interview dates" },
    { number: "3", title: "Secure Your Booking", description: "Pay with Razorpay to confirm" },
    { number: "4", title: "Join the Interview", description: "Get the meeting link instantly via email" }
  ];

  const targets = [
    { icon: "👨‍🎓", title: "Final-year students", description: "Get ahead of the competition by securing interviews before graduation" },
    { icon: "🎓", title: "Recent graduates", description: "Start your career journey with verified opportunities" },
    { icon: "👨‍💻", title: "Job seekers", description: "Find verified interview opportunities with top companies" }
  ];

  const benefits = [
    { icon: "📅", title: "Confirmed interview time slot", description: "No more waiting for callback or uncertainty" },
    { icon: "🤝", title: "Direct access to hiring teams", description: "Skip the long recruitment process" },
    { icon: "📱", title: "Real-time email notifications", description: "Stay updated throughout the process" },
    { icon: "💻", title: "Professional meeting environment", description: "Zoom/Google Meet link for smooth interviews" }
  ];

  return (
    <div className="app">
      <div className="dots">
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
      </div>

      <section className="hero">
        <div className="hero-container">
          <h1 className="hero-title">Start Your Career Journey — Book Verified Online Interviews with Top Recruiters</h1>
          <p className="hero-subtitle">Secure your interview slot in just a few clicks. Pay, verify, and prepare — we handle the rest. Get hired faster with our easy-to-use platform designed for freshers.</p>
          <div className="hero-buttons">
            <button className="btn-register" onClick={scrollToTop}>
              <FaArrowUp /> Top
            </button>
            <a href="#features" className="hero-learn-btn">Learn More</a>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="features-container">
          <h2 className="features-title">✅ Why Choose Us?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="process">
        <div className="process-container">
          <h2 className="process-title">💼 How It Works?</h2>
          <div className="process-steps">
            {steps.map((step, index) => (
              <div key={index} className="process-step">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="target">
        <div className="target-container">
          <h2 className="target-title">👨‍💻 For Whom Is This?</h2>
          <div className="target-grid">
            {targets.map((target, index) => (
              <div key={index} className="target-card">
                <div className="target-icon">{target.icon}</div>
                <h3 className="target-card-title">{target.title}</h3>
                <p className="target-description">{target.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="value">
        <div className="value-container">
          <h2 className="value-title">🔔 What You Get:</h2>
          <div className="value-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="value-item">
                <div className="value-icon">{benefit.icon}</div>
                <div className="value-content">
                  <h3 className="value-item-title">{benefit.title}</h3>
                  <p className="value-item-description">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-container">
          <h2 className="cta-title">🚀 Ready to Get Hired?</h2>
          <p className="cta-description">Book your slot and take the first step toward your dream job.</p>
          <div className="cta-buttons">
            <button className="btn-register" onClick={scrollToTop}>
              <FaArrowUp /> Top
            </button>
          </div>
        </div>
      </section>

      <section id="slots" className="slots">
        <div className="slots-container">
          <h2 className="slots-title">📅 Available Slots</h2>
          {loading ? (
            <div className="loading-message">Loading slots...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="home-slots-grid">
                {slots.map((slot, index) => (
                  <div key={index} className="slot-card">
                    <div className="slot-header">
                      <div className="slot-date-info">
                        <h3>{slot.date}</h3>
                        <p>{slot.day}</p>
                      </div>
                      <span className="slots-available">
                        {slot.openSlots} {slot.openSlots === 1 ? 'slot' : 'slots'} available
                      </span>
                    </div>
 <button className="btn-register" onClick={scrollToTop}>
              <FaArrowUp /> Top
            </button>                  </div>
                ))}
              </div>
              <div className="slots-footer">
                <p className='register'>
                  Book your interview slot. New slots are added every week!
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>BookYourFuture</h3>
              <p>The easiest way to book verified interviews with top recruiters. Designed for freshers and job seekers.</p>
              <div className="social-links">
                <a href="#" className="social-link"><span>f</span></a>
                <a href="#" className="social-link"><span>t</span></a>
                <a href="#" className="social-link"><span>in</span></a>
              </div>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#features" className="footer-link">Features</a></li>
                <li><a href="#how-it-works" className="footer-link">How It Works</a></li>
                <li><a href="#slots" className="footer-link">Available Slots</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Legal</h3>
              <ul className="footer-links">
                <li><a href="/terms-conditions" className="footer-link">Terms & Conditions</a></li>
                <li><a href="/privacy-policy" className="footer-link">Privacy Policy</a></li>
                <li><a href="/refund-policy" className="footer-link">Refund Policy</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Contact Us</h3>
              <p>Email: freshersync@freshersync.xyz</p>
              <p>Phone: +91 6301502931</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 BookYourFuture. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Sections;

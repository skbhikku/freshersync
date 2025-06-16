/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Start Your Career Journey —{' '}
              <span className="gradient-text">Book Verified Online Interviews</span>{' '}
              with Top Recruiters
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Secure your interview slot in just a few clicks. Pay, verify, and prepare — we handle the rest. 
              Get hired faster with our easy-to-use platform designed for freshers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={scrollToTop}
                className="btn-accent text-lg px-8 py-4 animate-bounce-in"
              >
                🚀 Get Started
              </button>
              <a href="#features" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">✅ Why Choose Us?</h2>
            <p className="text-xl text-slate-600">Experience the future of interview booking</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 group hover:scale-105 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">💼 How It Works?</h2>
            <p className="text-xl text-slate-600">Simple steps to your dream job</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="card p-8 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl group-hover:animate-glow">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">👨‍💻 For Whom Is This?</h2>
            <p className="text-xl text-slate-600">Perfect for ambitious professionals at every stage</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {targets.map((target, index) => (
              <div key={index} className="card p-8 text-center group hover:scale-105 transition-all duration-300">
                <div className={`w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                  <span className="text-3xl">{target.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{target.title}</h3>
                <p className="text-slate-600 leading-relaxed">{target.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">🔔 What You Get:</h2>
            <p className="text-xl text-slate-600">Comprehensive support for your interview success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="card p-8 flex items-start space-x-6 group hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">{benefit.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{benefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">🚀 Ready to Get Hired?</h2>
          <p className="text-xl text-blue-100 mb-8">Book your slot and take the first step toward your dream job.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={scrollToTop}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <FaArrowUp className="inline mr-2" /> Back to Top
            </button>
          </div>
        </div>
      </section>

      {/* Available Slots Section */}
      <section id="slots" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">📅 Available Slots</h2>
            <p className="text-xl text-slate-600">Book your interview slot today</p>
          </div>
          
          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading slots<span className="loading-dots"></span></p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 bg-red-50 p-8 rounded-2xl">
              <p className="text-lg">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slots.map((slot, index) => (
                  <div key={index} className="card p-6 group hover:scale-105 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{slot.date}</h3>
                        <p className="text-slate-600">{slot.day}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        {slot.openSlots} {slot.openSlots === 1 ? 'slot' : 'slots'} available
                      </span>
                    </div>
                    <button 
                      onClick={scrollToTop}
                      className="w-full btn-primary group-hover:scale-105 transition-transform duration-300"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12 p-8 bg-blue-50 rounded-2xl">
                <p className="text-slate-700 text-lg">
                  New slots are added every week!
                </p>
              </div>
            </>
          )}
        </div>
      </section>
      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all duration-300 z-40"
      >
        <FaArrowUp />
      </button>
    </div>
  );
};

export default Sections;

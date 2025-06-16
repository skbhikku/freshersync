/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Link } from 'react-router-dom';
import Register from './Register';
import { useState, useEffect } from 'react';
import Login from './Login';
import { getAvailableSlots } from '../api/auth';
import { 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  CreditCardIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import '../styles/HomePage.css'
const HomePage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const features = [
    { 
      icon: CheckCircleIcon, 
      title: "Interview Ready", 
      description: "Choose a date and time that fits your schedule perfectly",
      color: "from-green-500 to-emerald-500"
    },
    { 
      icon: ShieldCheckIcon, 
      title: "Verified Process", 
      description: "OTP-based email verification to keep things secure",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      icon: CreditCardIcon, 
      title: "Hassle-Free Payment", 
      description: "Powered by Razorpay, safe and smooth transactions",
      color: "from-purple-500 to-violet-500"
    },
    { 
      icon: EnvelopeIcon, 
      title: "Instant Confirmation", 
      description: "Get your interview link right in your inbox",
      color: "from-orange-500 to-red-500"
    },
    { 
      icon: GlobeAltIcon, 
      title: "100% Online", 
      description: "Attend interviews from anywhere, no travel needed",
      color: "from-teal-500 to-green-500"
    }
  ];

  const steps = [
    { 
      number: "1", 
      title: "Register & Verify", 
      description: "Sign up and verify your email with our secure process",
      icon: UserGroupIcon
    },
    { 
      number: "2", 
      title: "Choose Your Slot", 
      description: "Browse available interview dates and pick your perfect time",
      icon: CalendarDaysIcon
    },
    { 
      number: "3", 
      title: "Secure Your Booking", 
      description: "Pay with Razorpay to confirm your interview slot",
      icon: CreditCardIcon
    },
    { 
      number: "4", 
      title: "Join the Interview", 
      description: "Get the meeting link instantly via email and ace your interview",
      icon: ComputerDesktopIcon
    }
  ];

  const targets = [
    { 
      icon: AcademicCapIcon, 
      title: "Final-year students", 
      description: "Get ahead of the competition by securing interviews before graduation",
      gradient: "from-blue-500 to-indigo-500"
    },
    { 
      icon: UserGroupIcon, 
      title: "Recent graduates", 
      description: "Start your career journey with verified opportunities",
      gradient: "from-green-500 to-teal-500"
    },
    { 
      icon: BriefcaseIcon, 
      title: "Job seekers", 
      description: "Find verified interview opportunities with top companies",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const benefits = [
    { 
      icon: CalendarDaysIcon, 
      title: "Confirmed interview time slot", 
      description: "No more waiting for callback or uncertainty about your interview"
    },
    { 
      icon: UserPlusIcon, 
      title: "Direct access to hiring teams", 
      description: "Skip the long recruitment process and connect directly"
    },
    { 
      icon: DevicePhoneMobileIcon, 
      title: "Real-time email notifications", 
      description: "Stay updated throughout the entire process"
    },
    { 
      icon: ComputerDesktopIcon, 
      title: "Professional meeting environment", 
      description: "Zoom/Google Meet link for smooth, professional interviews"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">
                fresher<span className="text-indigo-600">Sync</span>
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">How It Works</a>
              <a href="#slots" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Available Slots</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="btn-secondary text-sm px-4 py-2"
              >
                Login
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="btn-primary text-sm px-4 py-2"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

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
                onClick={() => setShowRegisterModal(true)}
                className="btn-accent text-lg px-8 py-4 animate-bounce-in"
              >
                🚀 Register Now
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
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
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
                  <step.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
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
                <div className={`w-20 h-20 bg-gradient-to-r ${target.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                  <target.icon className="w-10 h-10 text-white" />
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
                  <benefit.icon className="w-8 h-8 text-white" />
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
              onClick={() => setShowLoginModal(true)} 
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Login
            </button>
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Register Now
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
                      onClick={() => setShowLoginModal(true)} 
                      className="w-full btn-primary group-hover:scale-105 transition-transform duration-300"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12 p-8 bg-blue-50 rounded-2xl">
                <p className="text-slate-700 text-lg">
                  <button onClick={() => setShowLoginModal(true)} className="text-blue-600 hover:text-blue-800 font-semibold underline">Login</button> or 
                  <button onClick={() => setShowRegisterModal(true)} className="text-blue-600 hover:text-blue-800 font-semibold underline ml-1">Register</button> 
                  to book your interview slot. New slots are added every week!
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 gradient-text">FresherSync</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                The easiest way to book verified interviews with top recruiters. 
                Designed for freshers and job seekers who want to accelerate their career journey.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <span className="text-sm font-bold">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <span className="text-sm font-bold">t</span>
                </a>
                <a href="#" className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
                  <span className="text-sm font-bold">in</span>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#slots" className="text-slate-300 hover:text-white transition-colors">Available Slots</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="/terms-conditions" className="text-slate-300 hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="/privacy-policy" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/refund-policy" className="text-slate-300 hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400">© 2025 FresherSync. All rights reserved.</p>
              <div className="mt-4 md:mt-0">
                <p className="text-slate-400">Email: freshersync@freshersync.xyz</p>
                <p className="text-slate-400">Phone: +91 6301502931</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
              onClick={() => setShowRegisterModal(false)}
            >
              ✕
            </button>
            <Register onClose={() => setShowRegisterModal(false)} />
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
              onClick={() => setShowLoginModal(false)}
            >
              ✕
            </button>
            <Login onClose={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

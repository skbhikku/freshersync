import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Settings from './Settings';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';
import '../styles/Navbar.css';
import { useOutletContext } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  if (!user) {
    return <div>Loading...</div>;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

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
              <Link 
                to="/navbar/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link ${isActive('/navbar/dashboard') ? 'active' : ''}`}
              >
                Dashboard
                {isActive('/navbar/dashboard') && <span className="active-indicator"></span>}
              </Link>
              
              <Link 
                to="/navbar/ai-interview" 
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link ${isActive('/navbar/ai-interview') ? 'active' : ''}`}
              >
                AI Interview
                {isActive('/navbar/ai-interview') && <span className="active-indicator"></span>}
              </Link>
              
              <Link 
                to="/navbar/placement" 
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link ${isActive('/navbar/placement') ? 'active' : ''}`}
              >
                Placement
                {isActive('/navbar/placement') && <span className="active-indicator"></span>}
              </Link>

              {/* User dropdown */}
               <div className="user-dropdown-container" ref={dropdownRef}>
                <button 
                  className="user-profile-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {showDropdown && (
                  <div className="user-dropdown-menu">
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        setShowSettings(true);
                        setShowDropdown(false);
                      }}
                    >
                      <SettingsIcon className="dropdown-icon" />
                      Settings
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      <LogOut className="dropdown-icon" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showSettings && (
        <Settings 
          user={user} 
          closeModal={() => setShowSettings(false)} 
          refreshUser={() => window.location.reload()} 
        />
      )}

      <Outlet context={{ user }} />
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
    </div>
  );
}

export function useNavbarContext() {
  return useOutletContext();
}

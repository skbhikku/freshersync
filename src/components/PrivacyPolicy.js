import React from 'react';
import '../styles/Pritermrefund.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>
      <div className="last-updated"><strong>Last Updated:</strong> May 29, 2025</div>
      
      <p>FresherSync ("we," "us," or "our") operates https://freshersync.xyz (the "Site"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.</p>
      
      <h2>1. Information We Collect</h2>
      <p>We collect the following information to provide our services:</p>
      <ul>
        <li><strong>Personal Identification:</strong> Full name, email address, phone number</li>
        <li><strong>Payment Information:</strong> Processed securely via Razorpay (we do not store card details)</li>
        <li><strong>Interview Details:</strong> Preferred time slots, resume/CV, educational background</li>
        <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
      </ul>
      
      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Schedule and confirm interview bookings</li>
        <li>Process payments through Razorpay</li>
        <li>Send interview confirmations and reminders</li>
        <li>Share relevant profile details with recruiters</li>
        <li>Improve our platform and services</li>
      </ul>
      
      <h2>3. Data Security</h2>
      <p>We implement industry-standard security measures including:</p>
      <ul>
        <li>SSL/TLS encryption for all data transfers</li>
        <li>Secure Razorpay payment processing (PCI-DSS compliant)</li>
        <li>Restricted access to personal information</li>
      </ul>
      
      <h2>4. Third-Party Sharing</h2>
      <p>We only share data with:</p>
      <ul>
        <li>Verified recruiters for interview coordination</li>
        <li>Razorpay for payment processing</li>
        <li>No sale of data to marketing agencies</li>
      </ul>
      
      <div className="contact">
        <h2>Contact Us</h2>
        <p>For privacy-related inquiries: <br />
        <strong>Email:</strong> freshersync@freshersync.xyz<br />
        <strong>Mail:</strong> Data Protection Officer, FresherSync, 123 Startup Lane, Tech City, TC 560001</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
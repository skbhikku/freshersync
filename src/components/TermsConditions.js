import React from 'react';
import '../styles/Pritermrefund.css';

const TermsConditions = () => {
  return (
    <div className="terms-container">
      <h1>Terms & Conditions</h1>
      <div className="effective-date"><strong>Effective Date:</strong> May 29, 2025</div>
      
      <div className="notice">
        <strong>Important:</strong> By using FresherSync, you agree to these legally binding terms.
      </div>
      
      <h2>1. Service Description</h2>
      <p>FresherSync provides a platform for job seekers ("Candidates") to book verified interview slots with registered recruiters ("Employers").</p>
      
      <h2>2. User Responsibilities</h2>
      <ul>
        <li>Provide accurate profile information</li>
        <li>Maintain professional conduct during interviews</li>
        <li>Secure your account credentials</li>
        <li>Attend scheduled interviews punctually</li>
      </ul>
      
      <h2>3. Payment Terms</h2>
      <ul>
        <li>All payments processed via Razorpay</li>
        <li>Interview slots are confirmed only after successful payment</li>
        <li>See our <a href="/refund-policy">Refund Policy</a> for cancellation details</li>
      </ul>
      
      <h2>4. Interview Process</h2>
      <ul>
        <li>Slots subject to recruiter availability</li>
        <li>Platform provides interview links via email</li>
        <li>Technical issues? Contact support within 15 minutes of interview start time</li>
      </ul>
      
      <h2>5. Limitation of Liability</h2>
      <p>We are not responsible for:</p>
      <ul>
        <li>Interview outcomes or job offers</li>
        <li>Technical issues beyond our control</li>
        <li>Recruiter conduct during interviews</li>
      </ul>
      
      <h2>6. Account Termination</h2>
      <p>We may suspend accounts for:</p>
      <ul>
        <li>Fraudulent activity</li>
        <li>Multiple no-shows for interviews</li>
        <li>Payment disputes</li>
      </ul>
      
      <p><strong>Governing Law:</strong> These terms are governed by the laws of India.</p>
    </div>
  );
};

export default TermsConditions;
import React from 'react';
import '../styles/Pritermrefund.css';

const RefundPolicy = () => {
  return (
    <div className="refund-container">
      <h1>Refund Policy</h1>
      <p><strong>Last Updated:</strong> May 29, 2025</p>
      
      <div className="policy-summary">
        <h2>Key Refund Principles</h2>
        <ul>
          <li>All refunds processed within <strong>7 business days</strong></li>
          <li>Refunds issued to original payment method</li>
          <li>Processing fee (₹50) deducted from all refunds</li>
        </ul>
      </div>

      <h2>Refund Eligibility</h2>
      <table>
        <thead>
          <tr>
            <th>Situation</th>
            <th>Refund Eligibility</th>
            <th>Timeframe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Recruiter cancels interview</td>
            <td>100% refund</td>
            <td>Within 24 hours</td>
          </tr>
          <tr>
            <td>Technical failure (platform error)</td>
            <td>100% refund</td>
            <td>Reported within 15 mins</td>
          </tr>
          <tr>
            <td>User cancels &gt; 48 hrs before interview</td>
            <td>80% refund</td>
            <td>Request 48+ hrs prior</td>
          </tr>
          <tr>
            <td>User cancels &lt; 48 hrs before interview</td>
            <td>No refund</td>
            <td>N/A</td>
          </tr>
        </tbody>
      </table>

      <div className="no-refund">
        <h2>Non-Refundable Situations</h2>
        <ul>
          <li>No-show for scheduled interview</li>
          <li>User technical issues (internet/device problems)</li>
          <li>Dissatisfaction with interview outcome</li>
        </ul>
      </div>

      <div className="refund-process">
        <h2>Refund Request Process</h2>
        <ol>
          <li>Email request to <strong>freshersync@freshersync.xyz</strong> with:
            <ul>
              <li>Booking ID</li>
              <li>Reason for refund</li>
              <li>Payment receipt</li>
            </ul>
          </li>
          <li>We'll respond within <strong>24 business hours</strong></li>
          <li>Approved refunds processed in 3-7 business days</li>
        </ol>
        <p><em>Note: Refunds may take 5-10 days to appear in your account depending on your bank.</em></p>
      </div>
    </div>
  );
};

export default RefundPolicy;
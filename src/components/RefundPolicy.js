import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RefundPolicy = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <div className="w-full px-0 sm:px-4 md:px-8 py-8">

        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 mb-8 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Refund Policy
          </h1>
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
            Last Updated: May 29, 2025
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Key Principles */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">📋</span>
              Key Refund Principles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">7</div>
                <p className="text-gray-700 font-semibold">Business Days</p>
                <p className="text-gray-600 text-sm">Processing Time</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-l-4 border-blue-500 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">💳</div>
                <p className="text-gray-700 font-semibold">Original Method</p>
                <p className="text-gray-600 text-sm">Refund Destination</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-l-4 border-orange-500 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">₹50</div>
                <p className="text-gray-700 font-semibold">Processing Fee</p>
                <p className="text-gray-600 text-sm">Deducted from Refunds</p>
              </div>
            </div>
          </div>

          {/* Refund Eligibility Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8 pb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✅</span>
                Refund Eligibility
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Situation</th>
                    <th className="px-6 py-4 text-left font-semibold">Refund Eligibility</th>
                    <th className="px-6 py-4 text-left font-semibold">Timeframe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-green-50 hover:bg-green-100 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">Recruiter cancels interview</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">100% refund</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">Within 24 hours</td>
                  </tr>
                  <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">Technical failure (platform error)</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">100% refund</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">Reported within 15 mins</td>
                  </tr>
                  <tr className="bg-yellow-50 hover:bg-yellow-100 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">User cancels  48 hrs before interview</td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">80% refund</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">Request 48+ hrs prior</td>
                  </tr>
                  <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">User cancels  48 hrs before interview</td>
                    <td className="px-6 py-4">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">No refund</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Non-Refundable Situations */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">🚫</span>
              Non-Refundable Situations
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '👻', title: 'No-show for scheduled interview' },
                { icon: '🔧', title: 'User technical issues (internet/device problems)' },
                { icon: '😞', title: 'Dissatisfaction with interview outcome' }
              ].map((item, index) => (
                <div key={index} className="bg-red-50 p-6 rounded-xl border border-red-200 text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <p className="text-gray-700 font-medium">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Refund Process */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Refund Request Process</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-3">Email Request</h3>
                <p className="text-sm opacity-90 mb-2">Send to: freshersync@freshersync.xyz</p>
                <ul className="text-sm opacity-90 space-y-1">
                  <li>• Booking ID</li>
                  <li>• Reason for refund</li>
                  <li>• Payment receipt</li>
                </ul>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-3">Quick Response</h3>
                <p className="text-sm opacity-90">We'll respond within 24 business hours</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-3">Processing</h3>
                <p className="text-sm opacity-90">Approved refunds processed in 3-7 business days</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-sm opacity-90 italic">
                Note: Refunds may take 5-10 days to appear in your account depending on your bank.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;

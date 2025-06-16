import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsConditions = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="w-full px-0 sm:px-4 md:px-8 py-8">

        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 mb-8 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
            Effective Date: May 29, 2025
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            Important Notice
          </h2>
          <p className="text-lg opacity-95">
            By using FresherSync, you agree to these legally binding terms.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <section className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Service Description
            </h2>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <p className="text-gray-700 text-lg leading-relaxed">
                FresherSync provides a platform for job seekers ("Candidates") to book verified interview slots with registered recruiters ("Employers").
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              User Responsibilities
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: '📝', title: 'Accurate Information', desc: 'Provide accurate profile information' },
                { icon: '🤝', title: 'Professional Conduct', desc: 'Maintain professional conduct during interviews' },
                { icon: '🔒', title: 'Account Security', desc: 'Secure your account credentials' },
                { icon: '⏰', title: 'Punctuality', desc: 'Attend scheduled interviews punctually' }
              ].map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-700 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Payment Terms
            </h2>
            <div className="space-y-4">
              {[
                'All payments processed via Razorpay',
                'Interview slots are confirmed only after successful payment',
                'See our Refund Policy for cancellation details'
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Interview Process
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
                <p className="text-gray-700 text-sm">Slots subject to recruiter availability</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Communication</h3>
                <p className="text-gray-700 text-sm">Platform provides interview links via email</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
                <p className="text-gray-700 text-sm">Technical issues? Contact support within 15 minutes</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
              Limitation of Liability
            </h2>
            <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500 mb-4">
              <p className="text-gray-900 font-semibold mb-4">We are not responsible for:</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '💼', title: 'Interview Outcomes', desc: 'Job offers or interview results' },
                { icon: '⚡', title: 'Technical Issues', desc: 'Issues beyond our control' },
                { icon: '👤', title: 'Recruiter Conduct', desc: 'Behavior during interviews' }
              ].map((item, index) => (
                <div key={index} className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-700 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
              Account Termination
            </h2>
            <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-500">
              <p className="text-gray-900 font-semibold mb-4">We may suspend accounts for:</p>
              <div className="space-y-3">
                {[
                  'Fraudulent activity',
                  'Multiple no-shows for interviews',
                  'Payment disputes'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p className="text-lg opacity-95">
              These terms are governed by the laws of India.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;

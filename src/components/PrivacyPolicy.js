import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full pt-[70px] bg-gradient-to-br from-slate-50 to-blue-50">
<div className="w-full px-0 sm:px-4 md:px-8 py-8">
        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 mb-8 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            Last Updated: May 29, 2025
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <p className="text-gray-700 leading-relaxed mb-8 text-lg">
            FresherSync ("we," "us," or "our") operates https://freshersync.xyz (the "Site"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">We collect the following information to provide our services:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500">
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Identification</h3>
                  <p className="text-gray-700 text-sm">Full name, email address, phone number</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500">
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                  <p className="text-gray-700 text-sm">Processed securely via Razorpay (we do not store card details)</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border-l-4 border-purple-500">
                  <h3 className="font-semibold text-gray-900 mb-2">Interview Details</h3>
                  <p className="text-gray-700 text-sm">Preferred time slots, resume/CV, educational background</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-l-4 border-orange-500">
                  <h3 className="font-semibold text-gray-900 mb-2">Technical Data</h3>
                  <p className="text-gray-700 text-sm">IP address, browser type, device information</p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                How We Use Your Information
              </h2>
              <ul className="space-y-3">
                {[
                  'Schedule and confirm interview bookings',
                  'Process payments through Razorpay',
                  'Send interview confirmations and reminders',
                  'Share relevant profile details with recruiters',
                  'Improve our platform and services'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Data Security
              </h2>
              <p className="text-gray-700 mb-4">We implement industry-standard security measures including:</p>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <ul className="space-y-2">
                  {[
                    'SSL/TLS encryption for all data transfers',
                    'Secure Razorpay payment processing (PCI-DSS compliant)',
                    'Restricted access to personal information'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Third-Party Sharing
              </h2>
              <p className="text-gray-700 mb-4">We only share data with:</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl">👥</div>
                  <p className="text-gray-700 text-sm">Verified recruiters for interview coordination</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl">💳</div>
                  <p className="text-gray-700 text-sm">Razorpay for payment processing</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl text-center border border-red-200">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl">🚫</div>
                  <p className="text-gray-700 text-sm">No sale of data to marketing agencies</p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 md:p-8 rounded-2xl text-white">
  <h2 className="text-2xl md:text-3xl font-bold mb-4">Contact Us</h2>
  <p className="mb-4 opacity-90">For privacy-related inquiries:</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm break-words whitespace-normal">
      <h3 className="font-semibold mb-2">Email</h3>
      <p className="opacity-90 break-words">freshersync@freshersync.xyz</p>
    </div>
    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm break-words whitespace-normal">
      <h3 className="font-semibold mb-2">Mail</h3>
      <p className="opacity-90 break-words">
        Data Protection Officer, FresherSync, Amaravathi, Guntur, Andhra Pradesh, 522237
      </p>
    </div>
  </div>
</section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

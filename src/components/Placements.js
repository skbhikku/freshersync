
import React from 'react';
import { AlertTriangle, Mail, ExternalLink, Briefcase, Users, DollarSign } from 'lucide-react';

const Placement = () => {
  return (
    <div className="min-h-screen pt-[70px] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full ">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Placement Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your gateway to off-campus opportunities and career advancement
          </p>
        </div>

        {/* Alert Banner */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Stay Alert with FresherSync!
              </h3>
              <p className="text-amber-700 leading-relaxed">
                This section is currently under development. Once available, we'll notify you via email 
                so you can start applying for exciting opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Off-Campus Opportunities */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="flex items-center text-white">
                <ExternalLink className="w-8 h-8 mr-3" />
                <h2 className="text-2xl font-bold">Off-Campus Jobs & Internships</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4 leading-relaxed">
                We provide exclusive access to off-campus job opportunities and internships 
                directly sourced from company career pages. These positions are carefully 
                curated for fresh graduates and students.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Direct links to company career pages
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Fresh job postings updated regularly
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Apply directly to companies
                </div>
              </div>
            </div>
          </div>

          {/* Salary Range */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
              <div className="flex items-center text-white">
                <DollarSign className="w-8 h-8 mr-3" />
                <h2 className="text-2xl font-bold">Fresher-Friendly Packages</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4 leading-relaxed">
                All job listings feature salary packages ranging from 3-10 LPA, 
                specifically designed for fresh graduates entering the job market.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">₹3-10 LPA</div>
                  <div className="text-sm text-green-700">Salary Range for Freshers</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                Exclusively for fresh graduates and final year students
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Browse Opportunities</h3>
              <p className="text-gray-600 text-sm">
                Explore curated job listings from top companies' career pages
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visit Company Page</h3>
              <p className="text-gray-600 text-sm">
                Click on provided links to go directly to company career pages
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Apply Directly</h3>
              <p className="text-gray-600 text-sm">
                Submit your application directly through the company's portal
              </p>
            </div>
          </div>
        </div>

        {/* Email Notification Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-4">Get Notified When We Launch</h2>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            We're working hard to bring you the best off-campus opportunities. 
            Once our placement section is ready, we'll send you an email notification 
            so you can start your job search journey immediately.
          </p>
          <div className="inline-flex items-center bg-white bg-opacity-20 rounded-lg px-6 py-3">
            <span className="text-sm font-medium">Stay tuned with FresherSync for updates!</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            This feature is under active development. We appreciate your patience as we work to deliver the best experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Placement;

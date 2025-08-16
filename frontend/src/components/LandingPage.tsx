import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-purple-400">Vending Community</div>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link 
              to="/login" 
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
          Transform Your Vending Machines
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          The affordable way to make your vending machines discoverable, profitable, and customer-friendly
        </p>
        <div className="mb-8 flex justify-center">
          <div className="text-6xl animate-bounce">🥤</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/login" 
            className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Start Free Trial
          </Link>
          <button className="border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">Everything You Need to Succeed</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6 animate-pulse">
              <div className="text-2xl">📊</div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Smart Analytics</h3>
                                    <p className="text-gray-200">
                          Track views, clicks, and customer behavior. Know exactly what's working and what's not.
                        </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6 animate-spin">
              <div className="text-2xl">⭐</div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                                    <p className="text-gray-200">
                          Build trust with customer reviews and ratings. Respond to feedback and improve your service.
                        </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6 animate-pulse">
              <div className="text-2xl">⚡</div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Featured Listings</h3>
                                    <p className="text-gray-200">
                          Get priority placement and more visibility. Stand out from the competition.
                        </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6 animate-ping">
              <div className="text-2xl">📱</div>
            </div>
            <h3 className="text-xl font-semibold mb-4">QR Code Stickers</h3>
                                    <p className="text-gray-200">
                          Generate branded QR codes for each machine. Customers can easily check products and prices.
                        </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6 animate-pulse">
              <div className="text-2xl">🔗</div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Embeddable Widgets</h3>
                                    <p className="text-gray-200">
                          Add machine information to your website or venue pages. Increase discoverability.
                        </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6 animate-pulse">
              <div className="text-2xl">✅</div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Easy Management</h3>
                                    <p className="text-gray-200">
                          Simple dashboard to manage all your machines. Update products, photos, and information easily.
                        </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
            <h3 className="text-2xl font-semibold mb-4">Starter</h3>
            <div className="text-4xl font-bold mb-6">
              €29<span className="text-lg text-gray-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Up to 5 machines
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic analytics
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Customer reviews
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                QR code generation
              </li>
            </ul>
            <Link 
              to="/login" 
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg text-center font-semibold transition-colors block"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-purple-600/20 backdrop-blur-sm rounded-xl p-8 border border-purple-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Pro</h3>
            <div className="text-4xl font-bold mb-6">
              €99<span className="text-lg text-gray-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Up to 25 machines
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                3 featured slots
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Embeddable widgets
              </li>
            </ul>
            <Link 
              to="/login" 
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg text-center font-semibold transition-colors block"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6 text-white">Ready to Transform Your Vending Business?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join operators who are already increasing their revenue and improving customer satisfaction.
        </p>
        <Link 
          to="/login" 
          className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block"
        >
          Get Started Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2025 Vending Community. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

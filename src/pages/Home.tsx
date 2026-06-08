import { Link } from 'react-router-dom';
import { Smartphone, Lock, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#FFFBF7] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <img src="/assets/images/logo.svg" alt="Watah Vida Logo" className="h-20 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] mb-4 brand-text">Watah Vida</h1>
          <p className="text-lg text-[#4A7C2A] font-semibold">2-in-1 Watermelon Rind Nuggets & Juice</p>
        </div>

        {/* Portal Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Kiosk Portal */}
          <Link to="/kiosk" className="group">
            <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full hover:bg-white/50">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-[#C0394B] to-[#A8C64F] p-4 rounded-2xl">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3 text-center">Kiosk</h2>
              <p className="text-[#4A7C2A] text-center text-sm mb-6">
                Order placement for staff and customers. Quick checkout with payment options.
              </p>
              <div className="text-sm text-[#1A1A1A] text-center font-medium">Place Your Order</div>
            </div>
          </Link>

          {/* Tracker Portal */}
          <Link to="/tracker" className="group">
            <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full hover:bg-white/50">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-[#A8C64F] to-[#4A7C2A] p-4 rounded-2xl">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3 text-center">Tracker</h2>
              <p className="text-[#4A7C2A] text-center text-sm mb-6">
                Track your orders in real-time, check loyalty rewards, and message the team.
              </p>
              <div className="text-sm text-[#1A1A1A] text-center font-medium">Track & Earn Rewards</div>
            </div>
          </Link>

          {/* Admin Portal */}
          <Link to="/admin" className="group">
            <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full hover:bg-white/50">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-[#4A7C2A] to-[#C0394B] p-4 rounded-2xl">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3 text-center">Admin</h2>
              <p className="text-[#4A7C2A] text-center text-sm mb-6">
                Secure dashboard for managing orders and fulfillment with real-time analytics.
              </p>
              <div className="text-sm text-[#1A1A1A] text-center font-medium">Manage Orders</div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">About Watah Vida</h3>
          <p className="text-[#4A7C2A] mb-4">
            Experience innovation with our 2-in-1 Watermelon Rind Nuggets and Fresh Juice. Every order is prepared fresh for you.
          </p>
          <div className="inline-block bg-[#A8C64F]/20 border border-[#A8C64F] rounded-full px-6 py-2 text-[#4A7C2A] font-semibold">
            ₱65.00 per order
          </div>
        </div>
      </div>
    </div>
  );
}

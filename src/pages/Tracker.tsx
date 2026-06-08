import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type Customer, type Order, type Message } from '../lib/supabase';
import { ChevronLeft, Send, MessageSquare } from 'lucide-react';

export default function Tracker() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'login' | 'dashboard' | 'messages'>('login');
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 'dashboard' && customer) {
      loadOrders();
      const subscription = supabase
        .from('orders')
        .on('*', (payload) => {
          if (payload.new.customer_id === customer.id) {
            loadOrders();
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [step, customer]);

  useEffect(() => {
    if (step === 'messages' && selectedOrder) {
      loadMessages();
      const subscription = supabase
        .from('messages')
        .on('*', (payload) => {
          if (payload.new.order_id === selectedOrder.id) {
            loadMessages();
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [step, selectedOrder]);

  const handleLogin = async () => {
    if (!name.trim() || !section.trim()) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      let { data: cust } = await supabase
        .from('customers')
        .select('*')
        .eq('name', name)
        .eq('section', section)
        .maybeSingle();

      if (!cust) {
        alert('Customer not found. Please check your name and section.');
        setLoading(false);
        return;
      }

      setCustomer(cust);
      setStep('dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!customer) return;
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedOrder) return;
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', selectedOrder.id)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder || !customer) return;
    setLoading(true);
    try {
      await supabase.from('messages').insert({
        order_id: selectedOrder.id,
        customer_id: customer.id,
        sender_type: 'customer',
        message: newMessage,
      });
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Pay':
        return 'bg-[#C0394B]/20 text-[#C0394B]';
      case 'Cooking':
        return 'bg-[#A8C64F]/20 text-[#A8C64F]';
      case 'Dispatched/In Transit':
        return 'bg-[#4A7C2A]/20 text-[#4A7C2A]';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (step === 'messages' && selectedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#FFFBF7] flex flex-col">
        <div className="backdrop-blur-xl bg-white/40 border-b border-white/60 p-4 sticky top-0">
          <button
            onClick={() => setStep('dashboard')}
            className="flex items-center gap-2 text-[#4A7C2A] hover:text-[#1A1A1A] font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A] mt-2">Order #{selectedOrder.id.slice(0, 8)}</h1>
          <p className="text-sm text-[#4A7C2A]">Chat with kitchen staff</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.sender_type === 'customer'
                  ? 'bg-[#A8C64F] text-white'
                  : 'bg-white/50 text-[#1A1A1A] border border-[#4A7C2A]/20'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="backdrop-blur-xl bg-white/40 border-t border-white/60 p-4 sticky bottom-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-xl border-2 border-[#4A7C2A]/30 bg-white/50 text-[#1A1A1A] placeholder-[#4A7C2A]/50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !newMessage.trim()}
              className="p-2 bg-gradient-to-r from-[#A8C64F] to-[#4A7C2A] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'dashboard' && customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#FFFBF7] p-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-[#4A7C2A] hover:text-[#1A1A1A] mb-6 font-semibold">
            <ChevronLeft className="w-5 h-5" />
            Home
          </Link>

          {/* Header */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Welcome, {customer.name}</h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#A8C64F]/20 rounded-2xl p-4">
                <p className="text-sm text-[#4A7C2A] font-semibold">Section</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{customer.section}</p>
              </div>
              <div className="bg-[#4A7C2A]/20 rounded-2xl p-4">
                <p className="text-sm text-[#1A1A1A] font-semibold">Loyalty Rewards</p>
                <p className="text-2xl font-bold text-[#4A7C2A]">{customer.loyalty_count}</p>
                {customer.loyalty_count === 10 && (
                  <p className="text-xs text-[#C0394B] font-bold mt-1">Free order unlocked!</p>
                )}
              </div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Your Orders</h2>
            {orders.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 text-center">
                <p className="text-[#4A7C2A]">No orders yet. Visit the kiosk to place one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">{order.quantity}x Watah Vida</p>
                        <p className="text-sm text-[#4A7C2A]">₱{order.total_price}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A7C2A] mb-2">
                      {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setStep('messages');
                      }}
                      className="w-full bg-[#4A7C2A]/20 text-[#4A7C2A] font-semibold py-2 rounded-lg hover:bg-[#4A7C2A]/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-6">
            <h3 className="font-bold text-[#1A1A1A] mb-3">About Watah Vida</h3>
            <p className="text-sm text-[#4A7C2A] mb-4">
              Every order brings you closer to a free meal! Get 10 orders for a free Watah Vida.
            </p>
            <button
              onClick={() => {
                setCustomer(null);
                setStep('login');
              }}
              className="w-full bg-[#C0394B]/20 text-[#C0394B] font-semibold py-2 rounded-lg hover:bg-[#C0394B]/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#FFFBF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-[#4A7C2A] hover:text-[#1A1A1A] mb-6 font-semibold">
          <ChevronLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Order Tracker</h1>
          <p className="text-[#4A7C2A] mb-8">Log in to track your orders and check loyalty rewards</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-2 rounded-xl border-2 border-[#4A7C2A]/30 bg-white/50 text-[#1A1A1A] placeholder-[#4A7C2A]/50"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Section *</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Your section"
              className="w-full px-4 py-2 rounded-xl border-2 border-[#4A7C2A]/30 bg-white/50 text-[#1A1A1A] placeholder-[#4A7C2A]/50"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#A8C64F] to-[#4A7C2A] text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Order, type Message } from '../lib/supabase';
import { ChevronLeft, Send, MessageSquare, TrendingUp } from 'lucide-react';

type AdminStep = 'password' | 'dashboard' | 'messages';

export default function Admin() {
  const [step, setStep] = useState<AdminStep>('password');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const ADMIN_PASSWORD = 'watahvidaadmin123!';

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setStep('dashboard');
      setPassword('');
    } else {
      setPasswordError('Incorrect password');
      setTimeout(() => setPasswordError(''), 3000);
    }
  };

  useEffect(() => {
    if (step === 'dashboard') {
      loadOrders();
      const subscription = supabase
        .from('orders')
        .on('*', () => {
          loadOrders();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [step]);

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

  const loadOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      setOrders(data || []);
      const revenue = (data || []).reduce((sum, order) => sum + order.total_price, 0);
      setTotalRevenue(revenue);
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase
        .from('orders')
        .update({
          order_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (newStatus === 'Completed') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          await supabase
            .from('customers')
            .update({ loyalty_count: supabase.rpc('increment_loyalty', { cust_id: order.customer_id }) })
            .eq('id', order.customer_id);
        }
      }

      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder) return;
    setLoading(true);
    try {
      await supabase.from('messages').insert({
        order_id: selectedOrder.id,
        customer_id: selectedOrder.customer_id,
        sender_type: 'admin',
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
            Back to Orders
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A] mt-2">Chat with {selectedOrder.customer_name}</h1>
          <p className="text-sm text-[#4A7C2A]">Order #{selectedOrder.id.slice(0, 8)}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.sender_type === 'admin'
                  ? 'bg-[#4A7C2A] text-white'
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

  if (step === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#FFFBF7] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-[#4A7C2A] hover:text-[#1A1A1A] font-semibold">
              <ChevronLeft className="w-5 h-5" />
              Home
            </Link>
            <button
              onClick={() => {
                setStep('password');
                setPassword('');
              }}
              className="text-[#C0394B] hover:text-[#1A1A1A] font-semibold"
            >
              Logout
            </button>
          </div>

          {/* Dashboard Header */}
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-[#A8C64F]" />
              <h1 className="text-3xl font-bold text-[#1A1A1A]">Admin Dashboard</h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#A8C64F]/20 rounded-2xl p-4">
                <p className="text-sm text-[#4A7C2A] font-semibold">Total Orders</p>
                <p className="text-3xl font-bold text-[#1A1A1A]">{orders.length}</p>
              </div>
              <div className="bg-[#4A7C2A]/20 rounded-2xl p-4">
                <p className="text-sm text-[#1A1A1A] font-semibold">Revenue</p>
                <p className="text-3xl font-bold text-[#4A7C2A]">₱{totalRevenue}</p>
              </div>
              <div className="bg-[#C0394B]/20 rounded-2xl p-4">
                <p className="text-sm text-[#C0394B] font-semibold">Completed</p>
                <p className="text-3xl font-bold text-[#C0394B]">
                  {orders.filter(o => o.order_status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Live Orders</h2>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 text-center">
                  <p className="text-[#4A7C2A]">No orders yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-2xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-[#4A7C2A] text-xs font-semibold">Customer</p>
                        <p className="text-[#1A1A1A] font-semibold">{order.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-[#4A7C2A] text-xs font-semibold">Room</p>
                        <p className="text-[#1A1A1A] font-semibold">{order.room_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#4A7C2A] text-xs font-semibold">Section</p>
                        <p className="text-[#1A1A1A] font-semibold">{order.section}</p>
                      </div>
                      <div>
                        <p className="text-[#4A7C2A] text-xs font-semibold">Qty</p>
                        <p className="text-[#1A1A1A] font-semibold">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-[#4A7C2A] text-xs font-semibold">Price</p>
                        <p className="text-[#1A1A1A] font-semibold">₱{order.total_price}</p>
                      </div>
                      <div>
                        <p className="text-[#4A7C2A] text-xs font-semibold">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {['To Pay', 'Cooking', 'Dispatched/In Transit', 'Completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          disabled={order.order_status === status}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            order.order_status === status
                              ? 'bg-[#4A7C2A]/30 text-[#4A7C2A]'
                              : 'bg-[#4A7C2A]/10 text-[#4A7C2A] hover:bg-[#4A7C2A]/20'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setStep('messages');
                        }}
                        className="ml-auto px-3 py-1 bg-[#A8C64F]/20 text-[#A8C64F] rounded-lg hover:bg-[#A8C64F]/30 transition-colors flex items-center gap-1 text-xs font-semibold"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
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
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Admin Console</h1>
          <p className="text-[#4A7C2A] mb-8">Secure access required</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 rounded-xl border-2 border-[#4A7C2A]/30 bg-white/50 text-[#1A1A1A] placeholder-[#4A7C2A]/50"
            />
            {passwordError && <p className="text-[#C0394B] text-sm mt-2">{passwordError}</p>}
          </div>

          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-gradient-to-r from-[#A8C64F] to-[#4A7C2A] text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

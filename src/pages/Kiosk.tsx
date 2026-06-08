import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type Customer, type Order } from '../lib/supabase';
import { ChevronLeft, Plus, Minus, Home } from 'lucide-react';

type KioskStep = 'order' | 'checkout' | 'success';

export default function Kiosk() {
  const [step, setStep] = useState<KioskStep>('order');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [section, setSection] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'cash'>('gcash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  const PRICE_PER_UNIT = 65;
  const totalPrice = quantity * PRICE_PER_UNIT;

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty > 0) setQuantity(newQty);
  };

  const handleCheckout = async () => {
    if (!customerName.trim() || !section.trim()) {
      alert('Please fill in customer name and section');
      return;
    }
    setStep('checkout');
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      // Get or create customer
      let { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('id')
        .eq('name', customerName)
        .eq('section', section)
        .maybeSingle();

      let customerId = customer?.id;

      if (!customer) {
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert({
            name: customerName,
            section: section,
            room_number: roomNumber || null,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        customerId = newCustomer.id;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          customer_name: customerName,
          room_number: roomNumber || null,
          section: section,
          seller_name: sellerName || 'n/a',
          quantity: quantity,
          total_price: totalPrice,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'gcash' ? 'Pending' : 'Paid',
          notes: notes,
          order_status: 'To Pay',
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      setLastOrderId(order.id);
      setStep('success');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error submitting order');
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    setStep('order');
    setQuantity(1);
    setCustomerName('');
    setRoomNumber('');
    setSection('');
    setSellerName('');
    setPaymentMethod('gcash');
    setNotes('');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#FFFBF7] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#A8C64F] to-[#4A7C2A] rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">Thank You!</h1>
            <p className="text-lg text-[#4A7C2A] mb-8">Your order has been placed successfully</p>

            <div className="bg-[#4A7C2A]/10 rounded-2xl p-4 mb-8 text-left">
              <div className="text-sm text-[#4A7C2A] font-semibold mb-2">Order Details</div>
              <div className="space-y-1 text-sm text-[#1A1A1A]">
                <div>Customer: {customerName}</div>
                <div>Quantity: {quantity} x ₱{PRICE_PER_UNIT}</div>
                <div className="font-bold pt-2 border-t border-[#4A7C2A]/20">Total: ₱{totalPrice}</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleNewOrder}
                className="w-full bg-gradient-to-r from-[#A8C64F] to-[#4A7C2A] text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Make New Order
              </button>
              <Link
                to="/tracker"
                className="block w-full bg-[#C0394B] text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 text-center"
              >
                Track Your Order
              </Link>
            </div>

            <Link to="/" className="inline-block mt-4 text-[#4A7C2A] hover:text-[#1A1A1A] font-medium flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#FFFBF7] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setStep('order')}
            className="flex items-center gap-2 text-[#4A7C2A] hover:text-[#1A1A1A] mb-6 font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl p-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Payment</h1>

            <div className="mb-8">
              <div className="bg-[#4A7C2A]/10 rounded-2xl p-4 mb-4">
                <div className="text-sm text-[#4A7C2A] font-semibold mb-2">Order Summary</div>
                <div className="text-[#1A1A1A]">
                  <div className="flex justify-between mb-2">
                    <span>{quantity}x Watah Vida</span>
                    <span>₱{totalPrice}</span>
                  </div>
                  <div className="border-t border-[#4A7C2A]/20 pt-2 font-bold flex justify-between">
                    <span>Total:</span>
                    <span>₱{totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border-2 rounded-xl cursor-pointer transition-colors" style={{borderColor: paymentMethod === 'gcash' ? '#4A7C2A' : '#C0394B'}}>
                  <input
                    type="radio"
                    name="payment"
                    value="gcash"
                    checked={paymentMethod === 'gcash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'gcash' | 'cash')}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-[#1A1A1A] font-medium">GCash / InstaPay</span>
                </label>
                <label className="flex items-center p-3 border-2 rounded-xl cursor-pointer transition-colors" style={{borderColor: paymentMethod === 'cash' ? '#4A7C2A' : '#C0394B'}}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'gcash' | 'cash')}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-[#1A1A1A] font-medium">Cash Payment</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'gcash' && (
              <div className="mb-6 bg-[#A8C64F]/20 border border-[#A8C64F] rounded-2xl p-4">
                <img src="/assets/images/gcash_qr.svg" alt="GCash QR Code" className="w-full rounded-xl mb-3" />
                <div className="text-sm text-[#1A1A1A]">
                  <p className="font-semibold mb-2">Scan to pay ₱{totalPrice}</p>
                  <p className="text-xs">Account: 09701306546 (J** P***)</p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                {paymentMethod === 'gcash' ? 'Reference Number (Last 4 digits)' : 'Notes (Optional)'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={paymentMethod === 'gcash' ? 'e.g., 1234' : 'e.g., Exact change'}
                className="w-full px-4 py-2 rounded-xl border-2 border-[#4A7C2A]/30 bg-white/50 text-[#1A1A1A] placeholder-[#4A7C2A]/50"
              />
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#A8C64F] to-[#4A7C2A] text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Order'}
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
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-6">Place Order</h1>

          {/* Product Display */}
          <div className="mb-8 text-center">
            <img src="/assets/images/product.svg" alt="Watah Vida Product" className="w-full rounded-2xl mb-4 h-48 object-cover" />
            <h2 className="text-2xl font-bold text-[#1A1A1A] brand-text">Watah Vida</h2>
            <p className="text-[#4A7C2A] font-semibold">2-in-1 Watermelon Rind Nuggets & Juice</p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">Quantity</label>
            <div className="flex items-center justify-center gap-4 bg-[#4A7C2A]/10 rounded-xl p-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-2 rounded-lg bg-[#C0394B]/20 text-[#C0394B] hover:bg-[#C0394B]/40 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold text-[#1A1A1A] min-w-12 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-2 rounded-lg bg-[#A8C64F]/20 text-[#A8C64F] hover:bg-[#A8C64F]/40 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="text-right mt-2 text-sm text-[#4A7C2A] font-semibold">
              ₱{PRICE_PER_UNIT} x {quantity} = <span className="text-lg">₱{totalPrice}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Customer Name *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
              className="w-full px-4 py-2 rounded-xl border-2 border-[#4A7C2A]/30 bg-white/50 text-[#1A1A1A] placeholder-[#4A7C2A]/50"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Room Number</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g., 304"
              className="w-full px-4 py-2 rounded-xl border-2 border-[#4A7C2A]/30 bg-white/50 text-[#1A1A1A] placeholder-[#4A7C2A]/50"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Section *</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., A, B, C"
              className="w-full px-4 py-2 rounded-xl border-2 border-[#4A7C2A]/30 bg-white/50 text-[#1A1A1A] placeholder-[#4A7C2A]/50"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Seller Name</label>
            <input
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="Leave blank if direct order"
              className="w-full px-4 py-2 rounded-xl border-2 border-[#4A7C2A]/30 bg-white/50 text-[#1A1A1A] placeholder-[#4A7C2A]/50"
            />
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-gradient-to-r from-[#A8C64F] to-[#4A7C2A] text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import axios from 'axios';

const PricingPage = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/auth';
        return;
      }
      
      const res = await axios.get('http://127.0.0.1:5000/api/payments/checkout', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initialize checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-20 px-6 text-center max-w-5xl">
      <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Level up your studies</h2>
      <p className="text-xl text-muted mb-16 max-w-2xl mx-auto">
        Choose the plan that fits your academic goals. Pause or cancel anytime.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        
        {/* Free Plan */}
        <div className="glass-panel p-8 flex flex-col hover:-translate-y-2 transition-transform duration-300">
          <h3 className="text-2xl font-bold mb-2">Basic Tracker</h3>
          <div className="text-5xl font-black mb-6">$0<span className="text-lg text-muted font-normal">/mo</span></div>
          <ul className="flex-1 flex flex-col gap-4 mb-8">
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>Basic Study Timer</span></li>
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>1 AI Deck Generation / day</span></li>
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>Weekly Analytics</span></li>
          </ul>
          <button className="btn btn-outline w-full cursor-default opacity-50">Current Plan</button>
        </div>

        {/* Pro Plan */}
        <div className="glass-panel p-8 flex flex-col border-2 border-primary relative transform lg:scale-105 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase py-1 px-4 rounded-full tracking-wider shadow-lg shadow-primary/30">Most Popular</div>
          <h3 className="text-2xl font-bold mb-2">Pro Scholar</h3>
          <div className="text-5xl font-black mb-6 text-white text-glow">$9<span className="text-lg text-muted font-normal">/mo</span></div>
          <ul className="flex-1 flex flex-col gap-4 mb-8">
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>Advanced Study Streaks</span></li>
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>20 AI Deck Generations / day</span></li>
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>PDF Exports & Custom Avatars</span></li>
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>Priority Support</span></li>
          </ul>
          <button onClick={handleCheckout} disabled={loading} className="btn btn-primary w-full shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-3 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20}/> : 'Upgrade to Pro'}
          </button>
          
          <div className="flex gap-2 w-full mt-2">
            <a href="https://payoneer.com/checkout" target="_blank" rel="noreferrer" className="btn btn-outline flex-1 p-2 text-xs">Payoneer</a>
            <a href="https://gumroad.com" target="_blank" rel="noreferrer" className="btn btn-outline flex-1 p-2 text-xs">Gumroad</a>
          </div>
          <div className="text-xs text-muted mt-4 text-center">
            Got a Gumroad/Payoneer access key? <a href="#" className="underline hover:text-white transition-colors">Redeem here</a>
          </div>
        </div>

        {/* Unlimited Plan */}
        <div className="glass-panel p-8 flex flex-col hover:-translate-y-2 transition-transform duration-300">
          <h3 className="text-2xl font-bold mb-2">Unlimited</h3>
          <div className="text-5xl font-black mb-6">$19<span className="text-lg text-muted font-normal">/mo</span></div>
          <ul className="flex-1 flex flex-col gap-4 mb-8">
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>Everything in Pro</span></li>
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>Unlimited AI Generations</span></li>
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>Custom AI Study Tutors</span></li>
            <li className="flex items-start gap-3"><Check className="text-primary shrink-0" /> <span>Early access to new features</span></li>
          </ul>
          <button onClick={handleCheckout} disabled={loading} className="btn btn-outline w-full mb-3 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20}/> : 'Get Unlimited'}
          </button>
          
          <div className="flex gap-2 w-full mt-2">
            <a href="https://payoneer.com/checkout" target="_blank" rel="noreferrer" className="btn btn-outline flex-1 p-2 text-xs">Payoneer</a>
            <a href="https://gumroad.com" target="_blank" rel="noreferrer" className="btn btn-outline flex-1 p-2 text-xs">Gumroad</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;

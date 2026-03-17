import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Brain, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = activeTab === 'login' ? { email, password } : { email, password, display_name: name };
      const res = await axios.post(`http://127.0.0.1:5000${endpoint}`, payload);

      if (activeTab === 'login') {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      } else {
        setSuccess('Account created! Signing you in...');
        setActiveTab('login');
        setPassword('');
        setName('');
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach the server. Please make sure the backend is running.');
      } else {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-background flex font-sans text-text overflow-hidden">

      {/* Left decorative panel — only on larger screens */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-16">
        {/* Subtle gradient blob */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_0%_50%,rgba(56,189,248,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[70%] h-[70%] bg-[radial-gradient(ellipse_70%_70%_at_100%_100%,rgba(168,85,247,0.06)_0%,transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative z-10 max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Brain size={22} className="text-primary" />
            </div>
            <span className="text-xl font-black tracking-tight">PulseFlow</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight leading-tight mb-5 text-white">
            Study smarter,<br />not harder.
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-14 max-w-xs">
            Your AI-powered study companion with voice flashcards, task tracking, and personalized coaching.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              'Voice-powered AI flashcards',
              'Gemini AI study coach',
              'Gamified progress tracking',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* University logos */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-xs text-muted/40 uppercase tracking-widest font-bold mb-5">Used at top universities</p>
            <div className="flex items-center gap-8 text-sm font-black tracking-widest text-muted/30">
              <span>LUMS</span>
              <span>NUST</span>
              <span>FAST</span>
              <span>MIT</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 relative">
        {/* Subtle right panel bg */}
        <div className="absolute inset-0 bg-white/[0.02] border-l border-white/5 hidden lg:block" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Brain size={20} className="text-primary" />
            </div>
            <span className="text-xl font-black tracking-tight">PulseFlow</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight mb-1.5">
              {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-muted text-sm">
              {activeTab === 'login'
                ? 'Sign in to access your dashboard.'
                : 'Start your free study journey today.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8 gap-1">
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-muted hover:text-white/70'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Abdul Mannan"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm placeholder:text-muted/40 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@university.edu"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm placeholder:text-muted/40 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-sm placeholder:text-muted/40 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {activeTab === 'login' && (
                <div className="flex justify-end">
                  <a href="#" className="text-xs text-muted hover:text-primary transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary py-4 mt-2 flex items-center justify-center gap-2 group rounded-xl font-bold text-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {activeTab === 'register' && (
                <p className="text-xs text-center text-muted/50 pt-2">
                  By signing up, you agree to our{' '}
                  <a href="#" className="text-primary/70 hover:text-primary underline underline-offset-2">Terms</a>{' '}
                  and{' '}
                  <a href="#" className="text-primary/70 hover:text-primary underline underline-offset-2">Privacy Policy</a>.
                </p>
              )}
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <Link to="/" className="text-xs text-muted/40 hover:text-muted transition-colors">
              ← Back to landing page
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Lock, ArrowLeft, Brain, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AICoachPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hi! I'm your AI Study Coach. What are we focusing on today?" }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const chatEndRef = useRef(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user && user.is_pro && token) {
      fetchRecommendations(token);
    }
  }, [user, loading, navigate, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchRecommendations = async (authToken) => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/ai/recommend', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error('Failed to get recommendations', err);
    }
  };

  const handleSend = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const text = overrideText || input;
    if (!text.trim() || isTyping) return;

    if (!user.is_pro) {
      navigate('/pricing');
      return;
    }

    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/ai/chat', 
        { messages: newMsgs.map(m => ({ role: m.role, content: m.content })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages([...newMsgs, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', content: 'Neural link interrupted. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Initializing Neural Link...</div>;

  if (user && !user.is_pro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel text-center p-12 max-w-lg relative z-10 shadow-2xl">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_30px_rgba(56,189,248,0.3)]">
            <Lock size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tighter">AI Coach is Locked</h2>
          <p className="text-muted mb-10 leading-relaxed">
            Supercharge your studies with a personalized 24/7 AI tutor powered by Gemini 3.0 Flash. Get custom plans, explanations, and instant feedback.
          </p>
          <div className="flex flex-col gap-4">
            <Link to="/pricing" className="btn btn-primary py-4 px-8 text-lg font-bold shadow-lg shadow-primary/20">Upgrade to Pro</Link>
            <Link to="/dashboard" className="btn btn-outline py-3 text-muted hover:text-white border-transparent">Back to Dashboard</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text overflow-hidden flex flex-col font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50 mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none opacity-50 mix-blend-screen" />

      {/* Header */}
      <header className="px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-full text-muted hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
              <Bot size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-white">AI Neural Tutor</h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Gemini 3.0 Connected
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <div className="text-xs font-bold text-muted flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
             <Crown size={14} className="text-yellow-400" /> Pro Scholar Account
           </div>
        </div>
      </header>

      <main className="flex-1 flex gap-6 max-w-[1400px] mx-auto w-full p-6 overflow-hidden">
        
        {/* RECOMMENDATIONS SIDEBAR */}
        <aside className="hidden lg:flex flex-col gap-6 w-80 shrink-0">
          <div className="glass-panel p-6 flex flex-col gap-6 bg-surface/40">
            <div>
              <h3 className="text-sm font-black text-white/50 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-secondary" /> Smart Suggestions
              </h3>
              <div className="flex flex-col gap-2">
                {recommendations.length > 0 ? recommendations.map((rec, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(null, `Help me understand: ${rec}`)}
                    className="text-left p-3 rounded-xl bg-white/5 border border-white/5 text-sm font-medium hover:bg-white/10 hover:border-white/10 transition-all group"
                  >
                    <span className="text-muted group-hover:text-white transition-colors">{rec}</span>
                  </button>
                )) : (
                  [1,2,3].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)
                )}
              </div>
            </div>

            <div className="mt-auto p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/20">
               <div className="flex items-center gap-2 mb-2">
                 <Brain size={16} className="text-primary" />
                 <span className="text-xs font-bold">Neural Engine</span>
               </div>
               <p className="text-[10px] text-muted leading-relaxed">Your tutor analyzes your courses, tasks, and previous study data to provide specific academic advice.</p>
            </div>
          </div>
        </aside>

        {/* CHAT INTERFACE */}
        <section className="flex-1 glass-panel flex flex-col p-0 overflow-hidden relative shadow-2xl bg-surface/30">
          
          {/* BACKGROUND TEXTURE */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

          {/* CHAT SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg ${m.role === 'user' ? 'bg-secondary/20 shadow-secondary/20' : 'bg-primary/20 shadow-primary/20'}`}>
                      {m.role === 'user' ? <UserIcon size={18} className="text-secondary" /> : <Bot size={18} className="text-primary" />}
                    </div>
                    <div className={`p-5 rounded-2xl text-base leading-relaxed ${m.role === 'user' ? 'bg-secondary text-white rounded-tr-none shadow-xl shadow-secondary/10' : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-none font-medium'}`}>
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Bot size={18} className="text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 backdrop-blur-xl relative z-10">
             <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
                <input 
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask for custom lecture notes or exam predictions..."
                  disabled={isTyping}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 pr-16 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all shadow-inner focus:shadow-[0_0_40px_rgba(56,189,248,0.1)]"
                />
                <button 
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-secondary transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:scale-100 group-hover:shadow-primary/20"
                >
                  {isTyping ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="ml-1" />}
                </button>
             </form>
             <p className="text-[10px] text-center text-muted mt-4 font-bold uppercase tracking-widest">Powered by PulseFlow Core Intelligence • Gemini-3-Ultra-Mesh</p>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AICoachPage;

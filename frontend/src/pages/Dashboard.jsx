import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerContext } from '../context/TimerContext';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Play, Square, Book, Crown, CheckCircle, ListTodo, Trophy, PlayCircle, Layers, Share2, Bot, Download, Settings, Mic, Flame, Coins, Lock, Send, Sparkles } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Consume Global Timer Context
  const { isActive, seconds, startTimer, stopTimer, formatTime } = useContext(TimerContext);

  // Data State
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      const token = localStorage.getItem('token');
      fetchAnalytics(token);
      fetchAchievements(token);
    }
  }, [user, loading, navigate]);

  const fetchAnalytics = async (token) => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/study/analytics/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data);
    } catch (err) { }
  };

  const fetchAchievements = async (token) => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/achievements/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAchievements(res.data.achievements);
    } catch (err) { }
  };

  const handleStopTimer = async () => {
    await stopTimer();
    const token = localStorage.getItem('token');
    if (token) {
      fetchAnalytics(token);
      fetchAchievements(token);
    }
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    setChatMessages([...chatMessages, { role: 'user', content: msgInput }, { role: 'assistant', content: 'Analyzing your context... (Pro API connected)' }]);
    setMsgInput('');
  };

  if (!user) return <div className="min-h-screen bg-background flex justify-center items-center text-white">Loading Pulse...</div>;

  return (
    <div className="min-h-screen bg-background text-text overflow-hidden relative">
      
      {/* Dynamic Background Pulse Layer */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full pointer-events-none opacity-50 mix-blend-screen animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[150px] rounded-full pointer-events-none opacity-50 mix-blend-screen animate-pulse-glow" style={{ animationDelay: '1s' }} />

      {/* GAMIFICATION HUD - Floating Pill Style */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-none">
        <div className="glass-panel w-full p-3 rounded-full flex justify-between items-center pointer-events-auto shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] bg-surface/90">
          <div className="flex items-center gap-3 pl-2">
            <h1 className="text-xl font-black tracking-tighter text-white">PULSEFLOW</h1>
            {user.is_pro ? (
              <span className="pro-badge"><Crown size={12}/> PRO</span>
            ) : (
              <Link to="/pricing" className="text-xs text-muted hover:text-white transition-colors">Free Plan</Link>
            )}
          </div>

          <div className="flex items-center gap-4 py-1.5 px-6 rounded-full border border-white/5 bg-black/20">
            <div className="flex items-center gap-2" title={`Level ${user.level || 1} | ${user.total_xp || 0} XP`}>
              <Sparkles size={14} className="text-primary"/>
              <span className="font-bold text-sm tracking-wide">{user.total_xp || 0} <span className="text-muted text-xs font-normal hidden sm:inline">XP</span></span>
            </div>
            <div className="w-[1px] h-[16px] bg-white/10"></div>
            <div className="flex items-center gap-2" title={`${user.streak || 0} Day Streak!`}>
              <Flame size={16} className="text-orange-500" />
              <span className="font-bold text-sm tracking-wide">{user.streak || 0}</span>
            </div>
            <div className="w-[1px] h-[16px] bg-white/10"></div>
            <div className="flex items-center gap-2" title={`${user.coins || 0} Pro Coins`}>
              <Coins size={14} className="text-yellow-400" />
              <span className="font-bold text-sm tracking-wide">{user.coins || 0}</span>
            </div>
          </div>

          <div className="pr-1">
            <Link to="/settings" className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5 group">
              <Settings size={18} className="text-muted group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 3-COLUMN LAYOUT - Adjusted padding for floating nav */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 pt-[120px] pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: TIMER ORB */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel text-center relative overflow-hidden group p-8">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-lg font-bold mb-8 text-white/90">Global Focus Orb</h3>
            
            {/* The Orb */}
            <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-4 ${isActive ? 'border-secondary blur-[2px] animate-pulse-glow shadow-[0_0_50px_rgba(168,85,247,0.8)]' : 'border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'} transition-all duration-700`}></div>
              {isActive && <div className="absolute inset-2 rounded-full border border-primary/50 animate-spin-slow"></div>}
              {isActive && <div className="absolute inset-[-10px] rounded-full bg-secondary/10 blur-xl"></div>}
              
              <div className="relative z-10 flex flex-col items-center">
                <span className={`text-4xl font-extrabold font-mono tracking-tighter ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-white/60'}`}>
                  {formatTime(seconds)}
                </span>
                {isActive && <span className="text-xs text-primary font-bold mt-1 uppercase tracking-widest">Focusing</span>}
              </div>
            </div>

            {/* Timer Controls */}
            {isActive ? (
              <button onClick={handleStopTimer} className="w-full btn bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                <Square size={18} className="mr-2" /> Stop Session
              </button>
            ) : (
              <button onClick={startTimer} className="w-full btn btn-primary">
                <Play size={18} className="mr-2" /> Start Focus
              </button>
            )}

            {!user.is_pro && (
              <div className="mt-4 text-xs text-muted flex items-center justify-center gap-1">
                <Lock size={12} className="text-yellow-400"/> Free tier: 25min limit
              </div>
            )}
          </motion.div>
          
          <div className="glass-panel p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Trophy size={18} className="text-yellow-500" /> Goal Progress</h3>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-primary h-full rounded-full w-[60%] shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>
            </div>
            <p className="text-xs text-muted text-right">3h / 5h Today</p>
          </div>
        </div>

        {/* CENTER: DASHBOARD CARDS (Parallax effect implicitly from styling overhauls) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <Link to="/flashcards" className="glass-panel p-6 group block hover:-translate-y-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transform group-hover:scale-110 transition-all duration-300">
                 <Mic size={100} />
               </div>
               <div className="relative z-10 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                 <Mic size={24} />
               </div>
               <h3 className="text-xl font-bold mb-2">Voice Flashcards</h3>
               <p className="text-sm text-muted">Generate cards instantly with your voice.</p>
               {!user.is_pro && <div className="mt-4 text-xs text-yellow-500 flex items-center gap-1 bg-yellow-400/10 w-fit px-2 py-1 rounded border border-yellow-400/20"><Lock size={10}/> 5 Daily Uses</div>}
            </Link>

            <Link to="/tasks" className="glass-panel p-6 group block hover:-translate-y-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transform group-hover:scale-110 transition-all duration-300">
                 <ListTodo size={100} />
               </div>
               <div className="relative z-10 w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-4 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                 <ListTodo size={24} />
               </div>
               <h3 className="text-xl font-bold mb-2">Upcoming Tasks</h3>
               <p className="text-sm text-muted">3 Assignments due this week.</p>
            </Link>
          </div>

          <div className="glass-panel p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2"><Layers size={20} className="text-accent"/> Deep Analytics</h3>
              {!user.is_pro ? (
                <Link to="/pricing" className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-white/10 text-muted"><Lock size={12}/> Pro Heatmap</Link>
              ) : (
                 <button onClick={() => {}} className="text-xs bg-accent/20 border border-accent/30 text-accent px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-accent hover:text-white transition-colors"><Download size={12}/> PDF Report</button>
              )}
            </div>
            <div className="h-[250px] bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-muted">
               <p>Daily Study Chart Preview</p>
            </div>
          </div>
        </div>

        {/* RIGHT: AI COACH CHAT */}
        <div className="lg:col-span-3 h-[calc(100vh-140px)] sticky top-[100px] flex flex-col glass-panel overflow-hidden border-l border-white/10">
          <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-pulse p-[2px]">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white mb-0.5">Study Coach</h3>
              <p className="text-[10px] text-primary tracking-widest uppercase font-bold flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Online
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm shadow-[0_4px_15px_rgba(56,189,248,0.3)]' : 'bg-white/10 border border-white/5 text-white/90 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white/5 border-t border-white/5 relative">
            {!user.is_pro && (
               <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                 <Lock size={24} className="text-yellow-400 mb-2"/>
                 <span className="text-xs text-center font-bold mb-2">AI Coach is Pro-Only</span>
                 <Link to="/pricing" className="text-xs bg-gradient-pulse text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-primary/20">Upgrade Now</Link>
               </div>
            )}
            <form onSubmit={sendChatMessage} className="relative">
              <input 
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                type="text" 
                placeholder="Ask me for a study plan..." 
                className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-primary placeholder-white/30"
                disabled={!user.is_pro}
              />
              <button 
                type="submit" 
                disabled={!user.is_pro}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-secondary transition-colors"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

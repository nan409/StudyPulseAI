import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, TrendingUp, Check, Zap, Target, Sparkles, ShieldCheck, ArrowRight, Mic, Bot, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text overflow-x-hidden font-sans">
      {/* Dynamic Background Pulses */}
      <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/20 blur-[130px] rounded-full pointer-events-none mix-blend-screen animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-secondary/10 blur-[130px] rounded-full pointer-events-none mix-blend-screen animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-primary/20 p-2 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Brain size={24} className="text-primary" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">PULSEFLOW</span>
          </motion.div>
          
          <motion.nav initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-8">
            <Link to="/auth" className="text-sm font-bold text-muted hover:text-white transition-colors hidden md:block">Sign In</Link>
            <Link to="/auth" className="btn btn-primary px-6 py-2.5 shadow-lg shadow-primary/20">Try PulseFlow Free</Link>
          </motion.nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-40 pb-32 md:pt-56 md:pb-48 px-6">
          <motion.div 
            initial="hidden" animate="visible" variants={containerVariants}
            className="max-w-[1000px] mx-auto text-center relative z-10"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-10 text-xs font-black tracking-widest uppercase shadow-[0_0_20px_rgba(56,189,248,0.1)]">
              <Sparkles size={14} className="text-primary animate-pulse"/> 
              <span className="text-primary/90">PulseFlow Core 3.0 Live</span>
              <span className="w-1 h-1 rounded-full bg-white/20 mx-1"></span>
              <span className="text-muted">Gemini 3.0 Ultra Mesh</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-[6.5rem] font-black tracking-tighter leading-[0.95] mb-8 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent italic">
              Synchronize Your <br className="hidden md:block" /> Study Brain.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
              Experience the world's most advanced AI study partner. 
              Built with <span className="text-white">spatial interfaces</span>, <span className="text-white">voice flashcards</span>, and <span className="text-white">Gemini 3.0</span>.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/auth" className="btn btn-primary px-10 py-5 text-xl font-black shadow-[0_20px_50px_rgba(56,189,248,0.4)] group flex items-center gap-2">
                Launch Dashboard <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-3 text-muted font-bold px-8 py-5 glass-panel bg-white/5 border-white/10">
                 <ShieldCheck size={20} className="text-green-500" /> PRO $9/MO
              </div>
            </motion.div>

            {/* Moving University Logos Marquee */}
            <motion.div variants={itemVariants} className="mt-24 relative overflow-hidden py-10">
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none"></div>
              <motion.div 
                className="flex items-center gap-12 md:gap-24 whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-12 md:gap-24">
                    <span className="text-3xl font-black tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">Harvard</span>
                    <span className="text-3xl font-black tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">Stanford</span>
                    <span className="text-3xl font-black tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">Oxford</span>
                    <span className="text-3xl font-black tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">MIT</span>
                    <span className="text-3xl font-black tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">LUMS</span>
                    <span className="text-3xl font-black tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">NUST</span>
                    <span className="text-3xl font-black tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">FAST</span>
                    <span className="text-3xl font-black tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">Berkeley</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-32 px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
            className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} whileHover={{ y: -10 }} className="glass-panel p-10 bg-surface/40 hover:bg-surface/60 transition-colors border-white/10 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg shadow-primary/10">
                <Mic size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight text-white">Voice Flashcards</h3>
              <p className="text-muted leading-relaxed font-medium">Generate expert flashcard decks simply by speaking. Optimized for Spaced Repetition (SRS).</p>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -10 }} className="glass-panel p-10 bg-surface/40 hover:bg-surface/60 transition-colors border-white/10 group">
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mb-8 text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-lg shadow-secondary/10">
                <Bot size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight text-white">AI Coach 24/7</h3>
              <p className="text-muted leading-relaxed font-medium">A dedicated Gemini 3.0 tutor that knows your course syllabus and predicts your exam blockers.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -10 }} className="glass-panel p-10 bg-surface/40 hover:bg-surface/60 transition-colors border-white/10 group">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-8 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-lg shadow-accent/10">
                <Layout size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight text-white">Spatial Planner</h3>
              <p className="text-muted leading-relaxed font-medium">Manage assignments, quizzes, and midterms in a beautiful, unified 2026 glass-morphism hub.</p>
            </motion.div>
          </motion.div>
        </section>

        {/* PRICING CALL TO ACTION */}
        <section className="py-40 px-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
            className="max-w-4xl mx-auto glass-panel p-16 text-center border-primary/20 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative z-10"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Ready to evolve your studying?</motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-muted mb-12 max-w-xl mx-auto font-medium">Join 50,000+ students reclaiming their focus and crushing their goals.</motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link to="/auth" className="btn btn-primary px-12 py-5 text-xl font-black shadow-lg shadow-primary/20 group">
                 Start Free Now
               </Link>
               <div className="flex items-center gap-2 text-sm font-bold text-muted">
                 <Check size={16} className="text-green-500" /> No credit card required 
                 <span className="mx-2 text-white/10">|</span>
                 <Check size={16} className="text-green-500" /> Cancel anytime
               </div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-white/5 opacity-60">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <Brain size={24} className="text-primary" />
             <span className="text-xl font-black tracking-tighter text-white">PULSEFLOW</span>
          </div>
          <div className="text-sm font-bold tracking-widest text-muted">© 2026 PULSEFLOW AI • ALL NEURAL LINKS RESERVED</div>
          <div className="flex gap-8">
            <Link to="#" className="text-sm font-bold hover:text-white transition-colors">Twitter</Link>
            <Link to="#" className="text-sm font-bold hover:text-white transition-colors">Discord</Link>
            <Link to="#" className="text-sm font-bold hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

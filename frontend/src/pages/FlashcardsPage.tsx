import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { 
  Plus, 
  Search, 
  Layers, 
  Play, 
  MoreVertical,
  Clock,
  Sparkles
} from 'lucide-react';

const FlashcardsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const decks = [
    { id: 1, title: 'Data Structures & Algorithms', count: 42, lastStudied: '2 days ago', subject: 'CS' },
    { id: 2, title: 'Calculus III: Integration', count: 28, lastStudied: 'Today', subject: 'Math' },
    { id: 3, title: 'Modern History: WW2', count: 56, lastStudied: 'Never', subject: 'History' },
    { id: 4, title: 'Python: Advanced Patterns', count: 15, lastStudied: '1 week ago', subject: 'CS' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
          <p className="text-slate-400 mt-2">Master topics using spaced repetition and AI-generated cards.</p>
        </div>
        <div className="flex gap-4">
          <button className="gradient-btn flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>
          <button className="bg-white/5 border border-white/10 text-white font-medium py-2 px-6 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Deck
          </button>
        </div>
      </header>

      {/* Stats & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search your decks..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500/50 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
            Total Cards: <span className="text-indigo-400">141</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium">
            Due Today: <span className="text-indigo-400">12</span>
          </div>
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())).map((deck) => (
          <GlassCard key={deck.id} hover padding="lg" className="group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                <Layers className="w-6 h-6" />
              </div>
              <button className="text-slate-500 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{deck.title}</h3>
            <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
              <span className="bg-slate-800 text-xs px-2 py-1 rounded-md font-bold text-slate-300">{deck.subject}</span>
              <span>•</span>
              {deck.count} cards
            </p>

            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Studied {deck.lastStudied}
              </div>
              <button className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl text-indigo-400 hover:text-indigo-300 transition-all">
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          </GlassCard>
        ))}

        {/* Create Card */}
        <button className="glass-card border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-white/5 transition-all p-8 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-indigo-400 group">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold tracking-tight">Create New Deck</span>
        </button>
      </div>
    </div>
  );
};

export default FlashcardsPage;

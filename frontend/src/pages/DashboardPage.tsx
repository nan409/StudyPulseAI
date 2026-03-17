import React from 'react';
import GlassCard from '../components/GlassCard';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp,
  Plus,
  Play
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Study Time', value: '12.4h', icon: Clock, color: 'text-blue-400' },
    { label: 'XP Gained', value: user?.xp_total || 0, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Daily Streak', value: '5 days', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Tasks Done', value: '8/12', icon: Target, color: 'text-purple-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.full_name}!</h1>
          <p className="text-slate-400 mt-2">You're doing great today. Ready to crush some goals?</p>
        </div>
        <div className="flex gap-4">
          <button className="gradient-btn flex items-center gap-2">
            <Play className="w-4 h-4 fill-current" />
            Start Studying
          </button>
          <button className="bg-white/5 border border-white/10 text-white font-medium py-2 px-6 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <GlassCard key={idx} hover className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard padding="lg">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Focused Study: Data Structures</p>
                    <p className="text-sm text-slate-500">45 minutes • Today, 10:30 AM</p>
                  </div>
                  <span className="text-indigo-400 font-bold">+50 XP</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Feed */}
        <div className="space-y-8">
          <GlassCard padding="lg" gradient>
            <h2 className="text-xl font-bold mb-6">Up Next</h2>
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Assignment</span>
                    <span className="text-xs text-slate-500">2 days left</span>
                  </div>
                  <p className="font-semibold">Math Quiz: Calculus III</p>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-2/3 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

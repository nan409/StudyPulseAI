import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Calendar as CalendarIcon,
  Tag,
  Star,
  ChevronRight
} from 'lucide-react';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete Math Quiz: Calculus III', course: 'Math 202', due: 'Today, 5:00 PM', priority: 'High', completed: false },
    { id: 2, title: 'Draft Essay: World War II', course: 'History 101', due: 'Tomorrow', priority: 'Medium', completed: false },
    { id: 3, title: 'Code Review: Data Structures', course: 'CS 301', due: 'Oct 20', priority: 'Low', completed: true },
    { id: 4, title: 'Read Chapter 4: Neural Networks', course: 'CS 450', due: 'Oct 22', priority: 'Medium', completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Tasks</h1>
          <p className="text-slate-400 mt-2">Organize your study sessions and hit your deadlines.</p>
        </div>
        <button className="gradient-btn flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </header>

      {/* Task Filters */}
      <div className="flex gap-4 overflow-x-auto pb-2 noscroll">
        {['All Tasks', 'Today', 'Upcoming', 'Completed', 'Important'].map((filter, idx) => (
          <button
            key={filter}
            className={`whitespace-nowrap px-6 py-2 rounded-xl text-sm font-bold border transition-all ${
              idx === 0 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <GlassCard 
            key={task.id} 
            padding="sm" 
            className={`group cursor-pointer hover:border-white/20 transition-all ${task.completed ? 'opacity-60' : ''}`}
            onClick={() => toggleTask(task.id)}
          >
            <div className="flex items-center gap-6">
              <button className="text-indigo-400 hover:scale-110 transition-transform">
                {task.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7 opacity-50" />}
              </button>
              
              <div className="flex-1 space-y-1">
                <h3 className={`text-lg font-bold ${task.completed ? 'line-through text-slate-500' : ''}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {task.course}
                  </span>
                  <span className={`flex items-center gap-1 ${task.due.includes('Today') ? 'text-orange-400' : ''}`}>
                    <Clock className="w-3 h-3" />
                    {task.due}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                  task.priority === 'High' ? 'bg-red-500/10 border-red-500/50 text-red-500' :
                  task.priority === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' :
                  'bg-green-500/10 border-green-500/50 text-green-500'
                }`}>
                  {task.priority}
                </span>
                <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity">
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Empty State Suggestion */}
      <GlassCard padding="lg" gradient className="text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-indigo-400 mx-auto" />
        <div>
          <h2 className="text-xl font-bold">Let AI help you organize?</h2>
          <p className="text-slate-400 max-w-md mx-auto mt-2">
            Ask StudyPulse AI to prioritize your tasks based on due dates and assignment weights.
          </p>
        </div>
        <button className="text-indigo-400 font-bold hover:underline flex items-center gap-2 mx-auto">
          Start AI Optimization
          <ChevronRight className="w-4 h-4" />
        </button>
      </GlassCard>
    </div>
  );
};

export default TasksPage;

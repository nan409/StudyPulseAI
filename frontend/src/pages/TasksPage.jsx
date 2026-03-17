import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Plus, Trash2, Calendar, Share2, ArrowLeft, LayoutList, Clock, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const TasksPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('assignment');
  const [dueDate, setDueDate] = useState('');
  const [token] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
    if (user && token) fetchTasks(token);
  }, [user, loading, navigate, token]);

  const fetchTasks = async (authToken) => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/tasks/', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!user.is_pro && tasks.filter(t => !t.is_completed).length >= 5) {
      navigate('/pricing');
      return;
    }
    try {
      await axios.post('http://127.0.0.1:5000/api/tasks/', {
        title,
        task_type: taskType,
        due_date: dueDate ? new Date(dueDate).toISOString() : null
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setTitle('');
      setDueDate('');
      fetchTasks(token);
    } catch (err) {
      console.error('Failed to create task');
    }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/tasks/${task.id}`, {
        is_completed: !task.is_completed
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      fetchTasks(token);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks(token);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareWhatsApp = (task) => {
    const text = task.is_completed
      ? `Just crushed my ${task.task_type}: ${task.title} using StudyPulse AI! 🎉`
      : `Grinding on my ${task.task_type}: ${task.title}. Wish me luck!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'quiz': return 'text-orange-400';
      case 'midterm': return 'text-pink-400';
      case 'final': return 'text-red-400';
      default: return 'text-primary';
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading Your Planner...</div>;

  return (
    <div className="min-h-screen bg-background text-text overflow-x-hidden relative flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-50" />

      {/* Header */}
      <header className="px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-full text-muted hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 p-2 rounded-xl border border-secondary/30">
              <LayoutList size={20} className="text-secondary" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">Task Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto w-full p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* CREATE TASK FORM */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          <div className="glass-panel p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary" />
            <h3 className="text-xl font-black mb-2 tracking-tight">New Deliverable</h3>
            <p className="text-sm text-muted mb-8 leading-relaxed">Track assignments and exams to earn XP and level up.</p>
            
            {(!user.is_pro && tasks.filter(t => !t.is_completed).length >= 5) ? (
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl text-center">
                <AlertCircle className="text-amber-500 mx-auto mb-3" size={32} />
                <h4 className="text-amber-500 font-bold mb-2">Limit Reached</h4>
                <p className="text-xs text-muted mb-6">Free tier is limited to 5 active tasks. Upgrade for unlimited productivity power.</p>
                <Link to="/pricing" className="btn btn-primary w-full py-3 shadow-lg shadow-primary/20">Upgrade to Pro</Link>
              </div>
            ) : (
              <form onSubmit={handleCreateTask} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Title</label>
                  <input 
                    type="text" className="input-field shadow-inner" 
                    placeholder="E.g. Computer Science Project" 
                    value={title} onChange={(e) => setTitle(e.target.value)} required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Category</label>
                  <select className="input-field shadow-inner" value={taskType} onChange={(e) => setTaskType(e.target.value)}>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="midterm">Midterm Exam</option>
                    <option value="final">Final Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Due Date</label>
                  <input 
                    type="datetime-local" className="input-field shadow-inner" 
                    value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-secondary w-full py-4 mt-2 flex items-center justify-center gap-2 font-bold shadow-lg shadow-secondary/10 hover:shadow-secondary/20 transition-all">
                  <Plus size={20} /> Add Task
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* TASK LIST AREA */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              Upcoming Deadlines
              <span className="text-xs font-bold bg-white/5 border border-white/5 py-1 px-3 rounded-full text-muted">{tasks.filter(t => !t.is_completed).length} Active</span>
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {tasks.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-12 text-center flex flex-col items-center gap-4 bg-surface/20">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted">
                    <CheckCircle size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">Clear Horizon</h4>
                    <p className="text-sm text-muted">No upcoming tasks! Enjoy your focus or start something new.</p>
                  </div>
                </motion.div>
              ) : (
                tasks.map((task) => (
                  <motion.div 
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className={`glass-panel p-5 flex items-center justify-between group relative overflow-hidden transition-all duration-300 ${task.is_completed ? 'bg-surface/10 opacity-60' : 'hover:bg-surface/40 hover:-translate-y-1 hover:shadow-xl'}`}
                  >
                    {/* Progress indicator border */}
                    {!task.is_completed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity" />}
                    
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <button 
                        onClick={() => toggleComplete(task)} 
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${task.is_completed ? 'bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border-white/10 hover:border-secondary text-transparent'}`}
                      >
                        <CheckCircle size={18} />
                      </button>
                      
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-lg font-bold truncate transition-all ${task.is_completed ? 'text-muted line-through' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className={`${getTypeColor(task.task_type)} text-[10px] font-black uppercase tracking-tighter bg-white/5 px-2.5 py-1 rounded border border-white/5`}>
                            {task.task_type}
                          </span>
                          {task.due_date && (
                            <span className={`text-[10px] font-bold flex items-center gap-1.5 ${new Date(task.due_date) < new Date() && !task.is_completed ? 'text-red-400' : 'text-muted'}`}>
                              <Clock size={12} />
                              {new Date(task.due_date) < new Date() && !task.is_completed ? 'Overdue' : formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleShareWhatsApp(task)}
                        className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"
                        title="Celebrate on WhatsApp"
                      >
                        <Share2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TasksPage;

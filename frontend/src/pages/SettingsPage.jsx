import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings as SettingsIcon, Calculator, Plus, Trash2, Save, LogOut, Palette, Lock, Bell, Shield, Download, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const defaultScale = [
  { grade: 'A', points: 4.0 },
  { grade: 'A-', points: 3.7 },
  { grade: 'B+', points: 3.3 },
  { grade: 'B', points: 3.0 },
  { grade: 'B-', points: 2.7 },
  { grade: 'C+', points: 2.3 },
  { grade: 'C', points: 2.0 },
  { grade: 'F', points: 0.0 },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateUser, logout, loading } = useAuth();
  const [profile, setProfile] = useState({ 
    display_name: '', 
    avatar_url: '', 
    weekly_goal_hours: 10,
    email_notifications: true,
    push_notifications: true,
    is_pro: false
  });
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [scale, setScale] = useState(defaultScale);
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ course_name: '', credit_hours: 3, grade: 'A' });
  const [cgpa, setCgpa] = useState(0.00);
  const [message, setMessage] = useState('');
  const { currentTheme, setCurrentTheme, themes } = useTheme();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
    if (user) {
      setProfile({
        display_name: user.display_name || '',
        avatar_url: user.avatar_url || '',
        weekly_goal_hours: user.weekly_goal_hours || 10,
        email_notifications: user.email_notifications ?? true,
        push_notifications: user.push_notifications ?? true,
        is_pro: user.is_pro
      });
      fetchCourses();
    }
  }, [user, loading, navigate]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:5000/api/user/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
      calculateCGPA(res.data, scale);
    } catch (err) {
      console.error('Failed to load courses', err);
    }
  };

  const calculateCGPA = (courseList, currentScale) => {
    if (courseList.length === 0) {
      setCgpa(0);
      return;
    }
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    courseList.forEach(course => {
      const scaleEntry = currentScale.find(s => s.grade === course.grade);
      const points = scaleEntry ? scaleEntry.points : 0;
      totalPoints += (points * course.credit_hours);
      totalCredits += Number(course.credit_hours);
    });
    
    setCgpa(totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://127.0.0.1:5000/api/user/settings', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      updateUser(profile);
      showMessage('Profile updated successfully!');
    } catch (err) {
      showMessage('Failed to update profile.', true);
    }
  };

  const handleScaleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://127.0.0.1:5000/api/user/settings', { cgpa_scale: scale }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('Grading scale saved!');
      calculateCGPA(courses, scale);
    } catch (err) {
      showMessage('Failed to save scale.', true);
    }
  };

  const addCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://127.0.0.1:5000/api/user/courses', newCourse, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedCourses = [...courses, { ...newCourse, id: res.data.id }];
      setCourses(updatedCourses);
      calculateCGPA(updatedCourses, scale);
      setNewCourse({ course_name: '', credit_hours: 3, grade: 'A' });
      showMessage('Course added!');
    } catch (err) {
      showMessage('Failed to add course.', true);
    }
  };

  const deleteCourse = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/api/user/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedCourses = courses.filter(c => c.id !== id);
      setCourses(updatedCourses);
      calculateCGPA(updatedCourses, scale);
    } catch (err) {
      showMessage('Failed to delete course.', true);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      showMessage('Passwords do not match.', true);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://127.0.0.1:5000/api/user/password', {
        old_password: passwords.old_password,
        new_password: passwords.new_password
      }, { headers: { Authorization: `Bearer ${token}` } });
      showMessage('Password changed successfully!');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to change password.', true);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:5000/api/user/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'studypulse_data_export.json');
      document.body.appendChild(link);
      link.click();
      showMessage('Data export started!');
    } catch (err) {
      showMessage('Export failed.', true);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('CRITICAL: This will delete your account and all study data forever. Proceed?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://127.0.0.1:5000/api/user/delete', {
          headers: { Authorization: `Bearer ${token}` }
        });
        handleLogout();
      } catch (err) {
        showMessage('Failed to delete account.', true);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="flex items-center gap-3 m-0 text-3xl font-bold tracking-tight">
          <SettingsIcon className="text-primary" size={28} /> Settings
        </h1>
        <button onClick={handleLogout} className="btn bg-red-500/10 text-red-500 border-transparent flex items-center gap-2 hover:bg-red-500/20 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 text-sm font-medium rounded-xl border ${message.isError ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 p-4 rounded-xl text-left font-bold transition-all duration-200 border-none cursor-pointer ${activeTab === 'profile' ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'}`}
          >
            <User size={20} /> User Profile
          </button>
          <button 
            onClick={() => setActiveTab('cgpa')}
            className={`flex items-center gap-3 p-4 rounded-xl text-left font-bold transition-all duration-200 border-none cursor-pointer ${activeTab === 'cgpa' ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'}`}
          >
            <Calculator size={20} /> CGPA Calculator
          </button>
          <button 
            onClick={() => setActiveTab('themes')}
            className={`flex items-center gap-3 p-4 rounded-xl text-left font-bold transition-all duration-200 border-none cursor-pointer ${activeTab === 'themes' ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'}`}
          >
            <Palette size={20} /> Themes
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-3 p-4 rounded-xl text-left font-bold transition-all duration-200 border-none cursor-pointer ${activeTab === 'preferences' ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'}`}
          >
            <Bell size={20} /> Preferences
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 p-4 rounded-xl text-left font-bold transition-all duration-200 border-none cursor-pointer ${activeTab === 'security' ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'}`}
          >
            <Shield size={20} /> Account & Security
          </button>
        </div>

        {/* Content Area */}
        <div className="glass-panel flex-1 w-full p-6 md:p-8">
          <AnimatePresence mode="wait">
            
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <User className="text-primary" /> Edit Profile
                </h2>
                
                <form onSubmit={handleProfileSave} className="flex flex-col gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-bold text-muted">Display Name</label>
                    <input type="text" className="input-field" value={profile.display_name} onChange={e => setProfile({...profile, display_name: e.target.value})} placeholder="How we should call you" />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-bold text-muted flex items-center gap-2">
                       Avatar URL {!profile.is_pro && <span className="text-[10px] text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded uppercase"><Lock size={10} /> Pro</span>}
                    </label>
                    <input 
                      type="url" 
                      className={`input-field ${!profile.is_pro ? 'opacity-50 cursor-not-allowed' : ''}`} 
                      value={profile.avatar_url} 
                      onChange={e => setProfile({...profile, avatar_url: e.target.value})} 
                      placeholder="https://example.com/avatar.png" 
                      disabled={!profile.is_pro}
                    />
                    {profile.avatar_url && (
                      <div className="mt-4">
                        <img src={profile.avatar_url} alt="Avatar preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                      </div>
                    )}
                  </div>
                  {!profile.is_pro && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="m-0 text-sm text-amber-500 flex items-center gap-2">
                        <Lock size={14} /> Custom avatars are a Pro feature. <Link to="/pricing" className="text-white underline hover:text-primary transition-colors">Upgrade now</Link>
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block mb-2 text-sm font-bold text-muted">Weekly Goal (Hours)</label>
                    <input type="number" min="1" max="168" className="input-field" value={profile.weekly_goal_hours} onChange={e => setProfile({...profile, weekly_goal_hours: parseInt(e.target.value)})} />
                  </div>
                  <button type="submit" className="btn btn-primary self-start flex items-center gap-2 mt-2">
                    <Save size={16} /> Save Changes
                  </button>
                </form>
              </motion.div>
            )}

              {activeTab === 'cgpa' && (
               <motion.div key="cgpa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                   <div>
                     <h2 className="text-2xl font-black m-0 flex items-center gap-3 tracking-tight">
                       <Calculator className="text-primary" /> CGPA & Progress
                     </h2>
                     <p className="text-sm text-muted mt-2">Track your academic trajectory with precision.</p>
                   </div>
                   <div className="bg-gradient-to-br from-primary to-secondary p-5 px-8 rounded-2xl text-center shadow-[0_15px_40px_rgba(56,189,248,0.3)] border border-white/20">
                     <div className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">Cumulative GPA</div>
                     <div className="text-5xl font-black tracking-tighter text-white">{cgpa}</div>
                   </div>
                  </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   
                   {/* Courses List */}
                   <div className="flex flex-col gap-6">
                     <h3 className="text-lg font-black tracking-tight">Active Courses</h3>
                     
                     {(!profile.is_pro && courses.length >= 5) ? (
                       <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                         <p className="m-0 text-sm text-amber-500 font-bold flex items-center gap-2">
                           <Lock size={14} /> Course capacity reached (5/5). 
                           <Link to="/pricing" className="text-white underline ml-1">Go Pro for unlimited</Link>
                         </p>
                       </div>
                     ) : (
                       <form onSubmit={addCourse} className="flex gap-3">
                         <input type="text" className="input-field flex-[3]" placeholder="Course Name" value={newCourse.course_name} onChange={e => setNewCourse({...newCourse, course_name: e.target.value})} required />
                         <input type="number" step="0.5" className="input-field flex-1 text-center" placeholder="Cr" value={newCourse.credit_hours} onChange={e => setNewCourse({...newCourse, credit_hours: e.target.value})} required />
                         <select className="input-field flex-1" value={newCourse.grade} onChange={e => setNewCourse({...newCourse, grade: e.target.value})}>
                           {scale.map(s => <option key={s.grade} value={s.grade}>{s.grade}</option>)}
                         </select>
                         <button type="submit" className="btn btn-primary p-3 shadow-lg shadow-primary/20"><Plus size={20} /></button>
                       </form>
                     )}

                     <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                       {courses.length === 0 ? (
                         <div className="text-muted text-center py-10 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                           <Layout className="mx-auto mb-3 opacity-20" size={32} />
                           <p className="text-sm font-bold">No academic data yet.</p>
                         </div>
                       ) : (
                         courses.map(course => (
                           <motion.div 
                             key={course.id} layout
                             className="flex justify-between items-center bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 p-4 rounded-xl transition-all group"
                           >
                             <div className="font-bold text-white tracking-tight">{course.course_name}</div>
                             <div className="flex items-center gap-6">
                               <span className="text-xs font-black tracking-widest text-muted">{course.credit_hours} UNITS</span>
                               <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-lg font-black text-xs">{course.grade}</span>
                               <button 
                                 onClick={() => deleteCourse(course.id)} 
                                 className="p-2 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                               >
                                 <Trash2 size={16} />
                               </button>
                             </div>
                           </motion.div>
                         ))
                       )}
                     </div>
                   </div>

                   {/* Grading Scale Customization */}
                   <div className="flex flex-col gap-6">
                     <h3 className="text-lg font-black tracking-tight">University Weightage</h3>
                     <p className="text-sm text-muted leading-relaxed">Customize your institution's specific point values for weighted calculations.</p>
                     
                     <form onSubmit={handleScaleSave} className="grid grid-cols-2 gap-3">
                       {scale.map((entry, index) => (
                         <div key={index} className="flex items-center gap-3 bg-white/[0.03] p-2 rounded-xl border border-white/5">
                           <div className="bg-white/5 w-10 h-10 flex items-center justify-center rounded-lg font-black text-primary border border-white/5 shadow-inner">{entry.grade}</div>
                           <input 
                             type="number" step="0.01" className="bg-transparent border-none text-white font-black w-full focus:outline-none focus:ring-0 text-right pr-2" 
                             value={entry.points} 
                             onChange={(e) => {
                               const newScale = [...scale];
                               newScale[index].points = parseFloat(e.target.value);
                               setScale(newScale);
                             }} 
                           />
                         </div>
                       ))}
                       <button type="submit" className="btn btn-secondary col-span-2 py-4 mt-2 flex items-center justify-center gap-2 font-bold shadow-lg shadow-secondary/10">
                         <Save size={18} /> Synchronize Scale
                       </button>
                     </form>
                   </div>
                   
                 </div>
               </motion.div>
            )}

            {activeTab === 'themes' && (
              <motion.div key="themes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 tracking-tight">
                  <Palette className="text-primary" /> Visual Identity
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(themes).map(([key, theme]) => {
                    const isLocked = key !== 'neon' && !profile.is_pro;
                    return (
                      <motion.div 
                        key={key} 
                        whileHover={!isLocked ? { y: -5, scale: 1.02 } : {}}
                        onClick={() => !isLocked && setCurrentTheme(key)}
                        className={`p-5 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 border-2 ${currentTheme === key ? 'border-primary shadow-[0_0_20px_rgba(56,189,248,0.2)]' : 'border-white/5'}`}
                        style={{ background: theme.colors.background }}
                      >
                        <div className="flex justify-between items-center mb-6 relative z-10">
                          <span className="font-black tracking-tight text-sm uppercase" style={{ color: theme.colors.text }}>{theme.name}</span>
                          {isLocked ? <Lock size={16} className="text-amber-500" /> : (currentTheme === key && <Check size={16} className="text-primary" />)}
                        </div>
                        <div className="flex gap-2 relative z-10">
                          <div className="w-8 h-8 rounded-lg shadow-lg" style={{ background: theme.colors.primary }}></div>
                          <div className="w-8 h-8 rounded-lg shadow-lg" style={{ background: theme.colors.secondary }}></div>
                          <div className="w-8 h-8 rounded-lg shadow-lg" style={{ background: theme.colors.surface }}></div>
                        </div>
                        
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 text-center">
                            <span className="text-[10px] font-black tracking-widest uppercase text-amber-500 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">Pro Locked</span>
                          </div>
                        )}
                        
                        {/* Fake elements for preview */}
                        <div className="mt-6 h-2 w-2/3 rounded-full opacity-20" style={{ background: theme.colors.text }}></div>
                        <div className="mt-2 h-2 w-1/2 rounded-full opacity-10" style={{ background: theme.colors.text }}></div>
                      </motion.div>
                    );
                  })}
                </div>
                {!profile.is_pro && (
                  <div className="glass-panel mt-10 p-8 text-center border-amber-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50" />
                    <p className="text-amber-500 font-bold mb-6 flex items-center justify-center gap-2">
                      <Sparkles size={18} /> Discover 5+ Adaptive Neural Themes with PulseFlow Pro.
                    </p>
                    <Link to="/pricing" className="btn btn-primary px-10 py-4 shadow-xl shadow-primary/20">Upgrade for $9/mo</Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 tracking-tight">
                  <Bell className="text-primary" /> Comms & Alerts
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-colors">
                    <div>
                      <h4 className="m-0 font-bold text-lg tracking-tight">Email Intel</h4>
                      <p className="m-0 text-sm text-muted mt-1">Receive weekly focus reports and achievement badges.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={profile.email_notifications} onChange={(e) => setProfile({...profile, email_notifications: e.target.checked})} />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-white/5 shadow-inner"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-colors">
                    <div>
                      <h4 className="m-0 font-bold text-lg tracking-tight">Neural Push</h4>
                      <p className="m-0 text-sm text-muted mt-1">Real-time study reminders and deadline countdowns.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={profile.push_notifications} onChange={(e) => setProfile({...profile, push_notifications: e.target.checked})} />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-white/5 shadow-inner"></div>
                    </label>
                  </div>
                  <button onClick={handleProfileSave} className="btn btn-primary self-start px-8 py-4 mt-4 shadow-lg shadow-primary/20 font-bold">Synchronize Preferences</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 tracking-tight">
                  <Shield className="text-primary" /> Safety & Integrity
                </h2>
                
                <div className="flex flex-col gap-10">
                  
                  {/* Password Change */}
                  <form onSubmit={handlePasswordChange} className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl">
                    <h3 className="text-lg font-black mb-6 tracking-tight flex items-center gap-2 italic">
                       <Lock size={18} className="text-primary" /> Rotate Credentials
                    </h3>
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                      <input type="password" placeholder="Old Neural Key" value={passwords.old_password} onChange={e => setPasswords({...passwords, old_password: e.target.value})} className="input-field" required />
                      <div className="hidden sm:block"></div>
                      <input type="password" placeholder="New Neural Key" value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} className="input-field" required />
                      <input type="password" placeholder="Verify Key" value={passwords.confirm_password} onChange={e => setPasswords({...passwords, confirm_password: e.target.value})} className="input-field" required />
                      <button type="submit" className="btn btn-secondary py-4 font-black mt-2 shadow-lg shadow-secondary/10">Update Keys</button>
                    </div>
                  </form>

                  {/* Data Export & Subscription */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col justify-between group hover:bg-white/[0.04] transition-colors">
                      <div>
                        <h3 className="text-lg font-black mb-2 tracking-tight">Vault Export</h3>
                        <p className="text-sm text-muted mb-6 leading-relaxed">Extract your entire history, flashcards, and neural metrics into a portable JSON vault.</p>
                      </div>
                      <button onClick={handleExportData} className="btn btn-outline border-white/10 group-hover:bg-white/5 py-3 w-full flex items-center justify-center gap-2">
                        <Download size={18} /> Export Vault
                      </button>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex flex-col justify-between group hover:bg-white/[0.04] transition-colors">
                      <div>
                        <h3 className="text-lg font-black mb-2 tracking-tight">Commerce Hub</h3>
                        <p className="text-sm text-muted mb-6 leading-relaxed">Manage your Pro membership, neural upgrades, and billing history through Lemon Squeezy.</p>
                      </div>
                      <a href="https://app.lemonsqueezy.com/my-orders" target="_blank" rel="noopener noreferrer" className="btn btn-primary py-3 w-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                        <ExternalLink size={18} /> Subscription Portal
                      </a>
                    </div>
                  </div>

                  {/* Account Deletion */}
                  <div className="mt-10 pt-10 border-t border-red-500/20">
                    <h3 className="text-red-500 text-lg font-black mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <AlertTriangle size={20} /> Terminal Sequence
                    </h3>
                    <p className="text-sm text-muted mb-8 leading-relaxed max-w-xl italic">Warning: Initiating account deletion will permanently scrub all neural data, achievements, and Pro status from our clusters. This action is atomic and non-reversible.</p>
                    <button onClick={handleDeleteAccount} className="px-8 py-3 bg-red-500/10 text-red-500 border border-red-500/40 rounded-xl hover:bg-red-500 hover:text-white transition-all font-black text-xs tracking-widest uppercase">
                      Delete Permanent Account
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

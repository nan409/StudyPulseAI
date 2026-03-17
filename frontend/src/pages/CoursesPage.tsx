import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { 
  BookOpen, 
  Plus, 
  Filter, 
  ChevronRight,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

const CoursesPage: React.FC = () => {
  const [filter, setFilter] = useState('Active');

  const courses = [
    { id: 1, name: 'Data Structures', code: 'CS301', instructor: 'Dr. Smith', grade: '3.8', color: 'border-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 2, name: 'Calculus III', code: 'MATH202', instructor: 'Prof. Jones', grade: '3.5', color: 'border-blue-500', bg: 'bg-blue-500/10' },
    { id: 3, name: 'Modern History', code: 'HIST101', instructor: 'Dr. Brown', grade: '4.0', color: 'border-purple-500', bg: 'bg-purple-500/10' },
    { id: 4, name: 'Machine Learning', code: 'CS450', instructor: 'Dr. AI', grade: '3.9', color: 'border-pink-500', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-slate-400 mt-2">Track your academic progress and AI-suggested study plans.</p>
        </div>
        <div className="flex gap-4">
          <button className="gradient-btn flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </header>

      {/* Filter & View Toggle */}
      <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/10 max-w-sm">
        {['Active', 'Completed', 'Archive'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {courses.map((course) => (
          <GlassCard key={course.id} hover padding="none" className={`border-l-4 ${course.color} overflow-hidden group`}>
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className={`w-20 h-20 rounded-2xl ${course.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold">{course.name}</h3>
                    <p className="text-slate-400 font-medium">{course.code} • {course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-indigo-400">{course.grade}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Current GPA</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    3 Assignments
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Layers className="w-4 h-4 text-slate-500" />
                    12 Flashcards
                  </div>
                  <div className="flex items-center gap-2 text-sm text-indigo-400 font-bold cursor-pointer hover:underline">
                    <Sparkles className="w-4 h-4" />
                    Study Plan
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <button className="p-3 rounded-full hover:bg-white/5 transition-colors text-slate-500 hover:text-white">
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;

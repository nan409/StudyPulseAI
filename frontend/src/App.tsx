import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
// Placeholders for other pages
import AIChatPage from './pages/AIChatPage';
import FlashcardsPage from './pages/FlashcardsPage';
import CoursesPage from './pages/CoursesPage';
import TasksPage from './pages/TasksPage';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p>This page is under development.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="ai" element={<AIChatPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="flashcards" element={<FlashcardsPage />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TimerProvider } from './context/TimerContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import GlobalTimer from './components/GlobalTimer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import FlashcardsPage from './pages/FlashcardsPage';
import PricingPage from './pages/PricingPage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import AICoachPage from './pages/AICoachPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TimerProvider>
          <Router>
        <div className="app-container">
          <GlobalTimer />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/coach" element={<AICoachPage />} />
          </Routes>
        </div>
      </Router>
    </TimerProvider>
  </ThemeProvider>
  </AuthProvider>
  );
}

export default App;

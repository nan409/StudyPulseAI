import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const themes = {
  neon: {
    name: 'Neon Pulse',
    className: 'theme-neon',
    colors: {
      primary: '#6366f1',
      secondary: '#ec4899',
      background: '#0f172a',
      surface: 'rgba(30, 41, 59, 0.7)',
      text: '#f8fafc',
      muted: '#94a3b8'
    }
  },
  moonlight: {
    name: 'Moonlight',
    className: 'theme-moonlight',
    colors: {
      primary: '#94a3b8',
      secondary: '#64748b',
      background: '#020617',
      surface: 'rgba(15, 23, 42, 0.8)',
      text: '#f1f5f9',
      muted: '#64748b'
    }
  },
  sunrise: {
    name: 'Sunrise',
    className: 'theme-sunrise',
    colors: {
      primary: '#f59e0b',
      secondary: '#ef4444',
      background: '#180c0c',
      surface: 'rgba(45, 20, 20, 0.7)',
      text: '#fff7ed',
      muted: '#a8a29e'
    }
  },
  matrix: {
    name: 'Matrix',
    className: 'theme-matrix',
    colors: {
      primary: '#22c55e',
      secondary: '#15803d',
      background: '#050505',
      surface: 'rgba(10, 20, 10, 0.8)',
      text: '#dcfce7',
      muted: '#166534'
    }
  },
  pastel: {
    name: 'Pastel Study',
    className: 'theme-pastel',
    colors: {
      primary: '#a78bfa',
      secondary: '#fb7185',
      background: '#1e1b4b',
      surface: 'rgba(49, 46, 129, 0.6)',
      text: '#eef2ff',
      muted: '#818cf8'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('neon');

  useEffect(() => {
    const savedTheme = localStorage.getItem('studyPulseTheme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme class to body
    const body = document.body;
    Object.values(themes).forEach(t => body.classList.remove(t.className));
    body.classList.add(themes[currentTheme].className);
    
    // Set CSS variables
    const colors = themes[currentTheme].colors;
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--text-main', colors.text);
    root.style.setProperty('--text-muted', colors.muted);
    
    localStorage.setItem('studyPulseTheme', currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

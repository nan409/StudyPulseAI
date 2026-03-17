import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Restore state from session storage if available so refresh doesn't kill it
    const savedActive = sessionStorage.getItem('timerActive') === 'true';
    const savedSeconds = parseInt(sessionStorage.getItem('timerSeconds') || '0', 10);
    
    if (savedActive) {
      setIsActive(true);
      setSeconds(savedSeconds);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          const newSeconds = s + 1;
          let user = {};
          try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e){}
          if (!user.is_pro && newSeconds >= 1500) {
            clearInterval(timerRef.current);
            setIsActive(false);
            stopTimer(); // Force save if hit limit
            return 1500;
          }
          sessionStorage.setItem('timerSeconds', newSeconds);
          return newSeconds;
        });
      }, 1000);
    } else {
      setSeconds(savedSeconds);
    }

    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
      sessionStorage.setItem('timerActive', 'true');
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          const newSeconds = s + 1;
          let user = {};
          try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e){}
          if (!user.is_pro && newSeconds >= 1500) {
            clearInterval(timerRef.current);
            setIsActive(false);
            stopTimer();
            return 1500;
          }
          sessionStorage.setItem('timerSeconds', newSeconds);
          return newSeconds;
        });
      }, 1000);
    }
  };

  const stopTimer = async () => {
    setIsActive(false);
    sessionStorage.setItem('timerActive', 'false');
    clearInterval(timerRef.current);
    
    if (seconds > 10) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.post('http://127.0.0.1:5000/api/study/sessions', 
            { duration_seconds: seconds },
            { headers: { Authorization: `Bearer ${token}` }}
          );
          // Optional: We could trigger a global re-fetch of analytics here, 
          // but usually pages fetch on mount which is fine.
        } catch (err) {
          console.error('Failed to save global session', err);
        }
      }
    }
    setSeconds(0);
    sessionStorage.setItem('timerSeconds', '0');
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TimerContext.Provider value={{ isActive, seconds, startTimer, stopTimer, formatTime }}>
      {children}
    </TimerContext.Provider>
  );
};

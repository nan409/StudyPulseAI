import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TimerContext } from '../context/TimerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Clock } from 'lucide-react';

const GlobalTimer = () => {
  const { isActive, seconds, formatTime, stopTimer } = useContext(TimerContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show the floating timer if we are on the dashboard (where the main timer is) or auth/landing pages
  const hiddenPaths = ['/', '/auth', '/dashboard'];
  const shouldHide = hiddenPaths.includes(location.pathname);

  return (
    <AnimatePresence>
      {isActive && !shouldHide && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/dashboard')}
          className="global-timer"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 999,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(16, 185, 129, 0.9))',
            backdropFilter: 'blur(10px)',
            padding: '12px 24px',
            borderRadius: '999px',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.25rem' }}>
            <Clock size={20} className="pulse-animation" />
            {formatTime(seconds)}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); stopTimer(); }}
            style={{ 
              background: 'rgba(0,0,0,0.2)', 
              border: 'none', 
              color: 'white', 
              padding: '6px', 
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Square size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalTimer;

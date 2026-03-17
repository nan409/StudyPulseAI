import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Brain, ArrowLeft, ArrowRight, Loader2, Download, Mic, Square } from 'lucide-react';

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeDeck, setActiveDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/auth');
    else fetchDecks(token);
  }, [navigate]);

  const fetchDecks = async (token) => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/flashcards/decks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDecks(res.data.decks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.is_pro && decks.length >= 5) {
      alert("Free tier is limited to 5 decks. Upgrade to Pro for unlimited generation!");
      return;
    }
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://127.0.0.1:5000/api/flashcards/generate', 
        { topic, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopic('');
      setNotes('');
      fetchDecks(token); // Refresh sidebar
      loadDeck(res.data.deck_id); // Auto open
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = handleAudioUpload;
      audioChunksRef.current = [];
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not available. Please allow mic permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    setGenerating(true);
  };

  const handleAudioUpload = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.is_pro && decks.length >= 5) {
        alert("Free tier is limited to 5 decks. Upgrade to Pro for unlimited generation!");
        return;
      }
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('topic', topic || 'Voice Notes'); 

      setGenerating(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://127.0.0.1:5000/api/flashcards/transcribe', 
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setTopic('');
      setNotes('');
      fetchDecks(token);
      loadDeck(res.data.deck_id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process voice flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const loadDeck = async (deckId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:5000/api/flashcards/decks/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveDeck(res.data);
      setCurrentCardIndex(0);
      setShowBack(false);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPDF = async (deckId, title) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:5000/api/export/pdf/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}_Notes.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="container mx-auto py-10 pb-20 grid grid-cols-1 md:grid-cols-[250px_1fr] md:gap-8 gap-6 max-w-6xl">
      
      {/* Sidebar: Generate & List */}
      <div className="glass-panel p-6 flex flex-col gap-6">
        <div>
          <h3 className="text-xl font-bold mb-1">AI Generator</h3>
          <p className="text-sm text-muted mb-4">Create flashcards instantly.</p>
          {(!JSON.parse(localStorage.getItem('user') || '{}').is_pro && decks.length >= 5) ? (
            <div className="text-center p-4 bg-amber-500/10 border border-amber-500 rounded-lg">
              <h4 className="text-amber-500 mb-2 font-bold">Deck Limit Reached</h4>
              <p className="text-xs mb-4 text-muted">Free users can have up to 5 decks. Upgrade to Pro for unlimited AI generation!</p>
              <button className="btn btn-primary w-full text-sm py-2" onClick={() => navigate('/pricing')}>Upgrade to Pro</button>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="flex flex-col gap-3">
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Mitochondria" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required 
              />
              <textarea 
                className="input-field max-h-32" 
                placeholder="Optional notes to include..." 
                rows={3} 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1 py-3" disabled={generating || isRecording}>
                  {generating ? <Loader2 className="animate-spin" size={18} /> : <span>Generate Deck</span>}
                </button>
                {!isRecording ? (
                  <button type="button" className="btn btn-outline px-4 transition-colors hover:bg-white/5 hover:text-primary" onClick={startRecording} disabled={generating} title="Voice Record">
                    <Mic size={18} />
                  </button>
                ) : (
                  <button type="button" className="btn px-4 bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all" onClick={stopRecording} title="Stop & Submit">
                    <Square size={18} className="animate-pulse" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
        
        <div className="border-t border-white/10 pt-4">
          <h3 className="font-bold mb-3 text-lg">Your Decks</h3>
          <ul className="flex flex-col gap-2">
            {decks.length === 0 ? <p className="text-sm text-muted">No decks yet.</p> : null}
            {decks.map(deck => (
              <li key={deck.id}>
                <button 
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeDeck?.deck?.id === deck.id 
                      ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-white/5 border border-white/5 text-muted hover:bg-white/10 hover:text-white'
                    }
                  `}
                  onClick={() => loadDeck(deck.id)}
                >
                  <div className="truncate">{deck.title}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main View: Study Area */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        {!activeDeck ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Brain size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Select or generate a deck to start studying.</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>{activeDeck.deck.title}</h2>
              <button className="btn btn-outline" onClick={() => downloadPDF(activeDeck.deck.id, activeDeck.deck.title)}>
                <Download size={18} style={{ marginRight: '8px' }} /> Export PDF
              </button>
            </div>
            
            {/* Flashcard Component */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div 
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  minHeight: '300px',
                  perspective: '1000px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowBack(!showBack)}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.6s',
                  transformStyle: 'preserve-3d',
                  transform: showBack ? 'rotateX(180deg)' : 'rotateX(0deg)'
                }}>
                  {/* Front */}
                  <div className="glass-panel" style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.05)'
                  }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '500' }}>{activeDeck.cards[currentCardIndex]?.front}</h3>
                    <div style={{ position: 'absolute', bottom: '16px', color: 'var(--primary)', fontSize: '0.875rem' }}>Tap to flip</div>
                  </div>
                  
                  {/* Back */}
                  <div className="glass-panel" style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px',
                    transform: 'rotateX(180deg)', background: 'linear-gradient(145deg, var(--surface), var(--primary-hover))',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.05)'
                  }}>
                    <p style={{ fontSize: '1.25rem', color: 'white', fontWeight: '400' }}>{activeDeck.cards[currentCardIndex]?.back}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => { setShowBack(false); setCurrentCardIndex(Math.max(0, currentCardIndex - 1)); }}
                disabled={currentCardIndex === 0}
              >
                <ArrowLeft size={20} />
              </button>
              <span>{currentCardIndex + 1} / {activeDeck.cards.length}</span>
              <button 
                className="btn btn-outline" 
                onClick={() => { setShowBack(false); setCurrentCardIndex(Math.min(activeDeck.cards.length - 1, currentCardIndex + 1)); }}
                disabled={currentCardIndex === activeDeck.cards.length - 1}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* CSS for spinner */}
      <style>{`
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default FlashcardsPage;

import React, { useState, useRef, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { 
  Send, 
  User, 
  Bot, 
  Trash2, 
  Mic, 
  Paperclip,
  Sparkles
} from 'lucide-react';
import { useAIStore } from '../stores/aiStore';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

const AIChatPage: React.FC = () => {
  const [input, setInput] = useState('');
  const { messages, addMessage, isStreaming, setStreaming, clearHistory } = useAIStore();
  const { accessToken } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    const tempId = Date.now().toString();
    addMessage({ id: tempId, role: 'user', content: userMessage });

    setStreaming(true);
    let assistantMessageContent = '';
    const assistantMessageId = (Date.now() + 1).toString();
    
    // Add an empty assistant message to update as we stream
    addMessage({ id: assistantMessageId, role: 'assistant', content: '' });

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map((m: any) => ({ role: m.role, content: m.content })),
          stream: true
        })
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6);
            if (content === '[DONE]') continue;
            
            assistantMessageContent += content;
            // Update the message in state
            useAIStore.setState((state: any) => ({
              messages: state.messages.map((m: any) => 
                m.id === assistantMessageId ? { ...m, content: assistantMessageContent } : m
              )
            }));
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      useAIStore.setState((state: any) => ({
        messages: state.messages.map((m: any) => 
          m.id === assistantMessageId ? { ...m, content: 'I apologize, but I encountered an error processing your request.' } : m
        )
      }));
    } finally {
      setStreaming(false);
    }
  };

  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Future: Start/Stop MediaRecorder and send to /api/ai/transcribe
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
      <header className="flex justify-between items-center bg-white/5 p-4 rounded-2xl glass-effect">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-btn p-0 flex items-center justify-center rounded-xl">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Study Coach</h1>
            <p className="text-xs text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Powered by Gemini 2.5 Flash
            </p>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          title="Clear History"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <GlassCard padding="none" className="flex-1 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <Bot className="w-16 h-16 text-indigo-400" />
              <div>
                <p className="text-xl font-bold">How can I help you study today?</p>
                <p className="text-sm">Ask me to explain concepts, generate quizzes, or plan your week.</p>
              </div>
            </div>
          )}
          {messages.map((m: any) => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'
              }`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-indigo-400" />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] ${
                m.role === 'user' ? 'bg-indigo-600/20 rounded-tr-none border border-indigo-500/20' : 'bg-white/5 rounded-tl-none border border-white/5'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 rounded-tl-none border border-white/5">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 pt-0">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything..."
              rows={1}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none max-h-32 overflow-y-auto"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="text-slate-500 hover:text-white transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                onClick={handleVoiceToggle}
                className={`transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:text-indigo-400'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() && !isStreaming ? 'gradient-btn text-white' : 'text-slate-600'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-600 mt-3 uppercase tracking-widest font-bold">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default AIChatPage;

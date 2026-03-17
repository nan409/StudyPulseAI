import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIState {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (message: Omit<Message, 'timestamp'>) => void;
  setStreaming: (status: boolean) => void;
  clearHistory: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, { ...message, timestamp: new Date() }] 
  })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  clearHistory: () => set({ messages: [] }),
}));


import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, UserProfile } from '../types';
import { getSchemeResponse } from '../services/geminiService';
import { t } from '../constants';

interface Props {
  profile: UserProfile;
  language: string;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
}

const ChatInterface: React.FC<Props> = ({ profile, language, isVoiceActive, onToggleVoice }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('chat_intro', language),
      timestamp: Date.now()
    }
  ]);
  
  // Re-run welcome message when language changes
  useEffect(() => {
    if (messages.length === 1) {
       setMessages([{
         id: '1',
         role: 'assistant',
         content: t('chat_intro', language),
         timestamp: Date.now()
       }]);
    }
  }, [language]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const response = await getSchemeResponse(input, history, profile);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        groundingUrls: response.urls
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered a network error. Please try again in a moment.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm ${
              m.role === 'user' 
                ? 'bg-orange-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 dark:text-slate-100 rounded-tl-none border dark:border-slate-700'
            }`}>
              <div className="prose-custom text-inherit dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
              
              {m.groundingUrls && m.groundingUrls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Links & Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {m.groundingUrls.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors inline-flex items-center gap-1"
                      >
                        🔗 {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={`text-[10px] mt-2 opacity-50 font-medium ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border dark:border-slate-700 flex gap-1 items-center">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></span>
              <span className="ml-2 text-xs font-medium text-slate-400 animate-pulse">Checking records...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2 lg:gap-4">
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-3 rounded-full transition-all shrink-0 ${
              isVoiceActive 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            title="Talk to Buddy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat_placeholder', language)}
            className="flex-1 p-3 rounded-xl border bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-orange-200 dark:shadow-none shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

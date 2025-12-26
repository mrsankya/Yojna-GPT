
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
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      const langMap: Record<string, string> = {
        'English': 'en-IN', 'Hindi': 'hi-IN', 'Marathi': 'mr-IN', 'Tamil': 'ta-IN', 'Bengali': 'bn-IN', 'Telugu': 'te-IN', 'Kannada': 'kn-IN', 'Gujarati': 'gu-IN', 'Malayalam': 'ml-IN', 'Punjabi': 'pa-IN', 'Urdu': 'ur-IN'
      };
      recognitionRef.current.lang = langMap[language] || 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsDictating(false);
      };
      recognitionRef.current.onerror = () => setIsDictating(false);
      recognitionRef.current.onend = () => setIsDictating(false);
    }
  }, [language]);

  const toggleDictation = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isDictating) {
      recognitionRef.current.stop();
    } else {
      setIsDictating(true);
      recognitionRef.current.start();
    }
  };

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
      const response = await getSchemeResponse(input, history, profile, language);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        groundingUrls: response.urls
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error. If you are offline, I am trying to use my local database, but something went wrong. Please check your connection.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const shareToWhatsApp = (title: string, uri: string) => {
    const text = encodeURIComponent(`I found this useful Government Link on SmartGov Buddy: ${title}\nLink: ${uri}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 h-full relative">
      {!isOnline && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-[10px] font-bold py-1 px-4 text-center border-b border-yellow-200 dark:border-yellow-800 uppercase tracking-widest">
          ⚠️ Offline Mode: Searching Local Database Only
        </div>
      )}
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 pt-10">
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
                      <div key={idx} className="flex items-center gap-1">
                        <a 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-l-full border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors inline-flex items-center gap-1 border-r-0"
                        >
                          🔗 {link.title}
                        </a>
                        <button 
                          onClick={() => shareToWhatsApp(link.title, link.uri)}
                          className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-r-full border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors border-l-0"
                        >
                          <i className="fa-brands fa-whatsapp"></i>
                        </button>
                      </div>
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
            disabled={!isOnline}
            className={`p-3 rounded-full transition-all shrink-0 ${
              !isOnline ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
              isVoiceActive 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            title={isOnline ? "Live Audio Assistant" : "Voice assistant disabled offline"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <div className="flex-1 relative flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat_placeholder', language)}
              className="w-full p-3 pr-12 rounded-xl border bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={toggleDictation}
              className={`absolute right-3 p-1.5 rounded-lg transition-colors ${
                isDictating 
                  ? 'text-red-500 animate-pulse' 
                  : 'text-slate-400 hover:text-orange-500'
              }`}
              title="Dictate message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </button>
          </div>

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

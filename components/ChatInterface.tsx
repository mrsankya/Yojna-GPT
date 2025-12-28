
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, UserProfile } from '../types';
import { getSchemeResponse, generateSpeech } from '../services/geminiService';
import { t } from '../constants';

interface Props {
  profile: UserProfile;
  language: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
}

// Audio Utils
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ChatInterface: React.FC<Props> = ({ profile, language, messages, setMessages, isVoiceActive, onToggleVoice }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasApiError, setHasApiError] = useState(false);
  const [dismissedInfo, setDismissedInfo] = useState(false);
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio Context Ref for playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSources = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handleStatusChange = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        setHasApiError(false);
        setDismissedInfo(false);
      }
    };
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle bot speech when a new message arrives and auto-speak is on
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (isAutoSpeakEnabled && lastMessage?.role === 'assistant' && !lastMessage.isVoice && messages.length > 1) {
      speakMessage(lastMessage.content);
    }
  }, [messages.length, isAutoSpeakEnabled]);

  const speakMessage = async (text: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setIsBotSpeaking(true);
    const base64Audio = await generateSpeech(text, language);
    
    if (base64Audio && audioContextRef.current) {
      try {
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          audioContextRef.current,
          24000,
          1
        );
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          activeSources.current.delete(source);
          if (activeSources.current.size === 0) setIsBotSpeaking(false);
        };
        
        activeSources.current.add(source);
        source.start();
      } catch (err) {
        console.error("Audio playback error:", err);
        setIsBotSpeaking(false);
      }
    } else {
      setIsBotSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    activeSources.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    activeSources.current.clear();
    setIsBotSpeaking(false);
  };

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

    // Stop bot from speaking if user starts a new query
    stopSpeaking();

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
      
      if (response.isLimited) {
        setHasApiError(true);
      } else {
        setHasApiError(false);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        groundingUrls: response.urls
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setHasApiError(true);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "issue with server you can ask me only yojna (schemes)",
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

  const isLimited = (!isOnline || hasApiError) && !dismissedInfo;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 h-full relative">
      {/* Informational Header with Toggle */}
      <div className="absolute top-0 inset-x-0 h-14 border-b dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-20 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isOnline ? 'System Online' : 'Offline Mode'}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (isAutoSpeakEnabled) stopSpeaking();
              setIsAutoSpeakEnabled(!isAutoSpeakEnabled);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
              isAutoSpeakEnabled 
                ? 'bg-orange-600 text-white border-orange-500 shadow-md scale-105' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={isAutoSpeakEnabled ? "Disable Auto-Speak" : "Enable Auto-Speak"}
          >
            <div className="relative">
               <i className={`fa-solid ${isAutoSpeakEnabled ? 'fa-volume-high' : 'fa-volume-xmark'} text-xs`}></i>
               {isBotSpeaking && isAutoSpeakEnabled && (
                 <span className="absolute -top-1 -right-1 flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                 </span>
               )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {isBotSpeaking ? 'Speaking...' : isAutoSpeakEnabled ? 'Speak ON' : 'Speak OFF'}
            </span>
          </button>
        </div>
      </div>

      {isLimited && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-orange-600/90 backdrop-blur-md text-white text-[10px] md:text-xs font-bold py-2 px-4 rounded-full shadow-lg border border-orange-400 flex items-center gap-3 whitespace-nowrap">
            <span className="flex h-2 w-2 rounded-full bg-orange-200 animate-pulse"></span>
            issue with server you can ask me only yojna (schemes)
            <button 
              onClick={() => setDismissedInfo(true)} 
              className="ml-1 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 pt-20">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-sm relative ${
              m.role === 'user' 
                ? 'bg-orange-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 dark:text-slate-100 rounded-tl-none border dark:border-slate-700'
            }`}>
              {m.isVoice && (
                <div className="absolute -top-3 -right-2 bg-orange-100 dark:bg-orange-950 text-orange-600 p-1.5 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm z-10" title="Sent via Voice">
                  <i className="fa-solid fa-microphone text-[8px]"></i>
                </div>
              )}
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
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 116 0v6a3 3 0 0 0-3 3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" x2="12" y1="19" y2="22"/>
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

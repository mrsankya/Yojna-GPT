
import React, { useEffect, useState, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { INDIAN_LANGUAGES } from '../constants';

interface Props {
  onClose: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  systemInstruction: string;
  onAddMessage: (content: string, role: 'user' | 'assistant', isVoice: boolean) => void;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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

const VoiceOverlay: React.FC<Props> = ({ onClose, language, setLanguage, systemInstruction, onAddMessage }) => {
  const [status, setStatus] = useState<'Connecting...' | 'Listening...' | 'Speaking...' | 'Error'>('Connecting...');
  const [isMuted, setIsMuted] = useState(false);
  
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  const sessionRef = useRef<any>(null);
  const connectionInProgress = useRef(false);
  const isMounted = useRef(true);
  const isMutedRef = useRef(false);

  // Sync ref with state for the audio processor closure
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isMounted.current = true;
    if (connectionInProgress.current) return;
    
    let nextStartTime = 0;
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);
    
    const sources = new Set<AudioBufferSourceNode>();
    let micStream: MediaStream | null = null;

    const startSession = async () => {
      if (connectionInProgress.current) return;
      connectionInProgress.current = true;

      try {
        if (!isMounted.current) return;

        if (inputAudioContext.state === 'suspended') await inputAudioContext.resume();
        if (outputAudioContext.state === 'suspended') await outputAudioContext.resume();

        // Start Live Session
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Ensure we use a fresh instance to avoid socket reuse errors
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              if (!isMounted.current) return;
              setStatus('Listening...');
              
              const source = inputAudioContext.createMediaStreamSource(micStream!);
              const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                // Skip sending audio if muted
                if (isMutedRef.current) return;

                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmBlob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                
                sessionPromise.then((session) => {
                  if (session && isMounted.current) {
                    session.sendRealtimeInput({ media: pcmBlob });
                  }
                });
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (!isMounted.current) return;
              
              if (message.serverContent?.inputTranscription) {
                currentInputTranscription.current += message.serverContent.inputTranscription.text;
              }
              if (message.serverContent?.outputTranscription) {
                currentOutputTranscription.current += message.serverContent.outputTranscription.text;
              }

              if (message.serverContent?.turnComplete) {
                const userT = currentInputTranscription.current.trim();
                const assistantT = currentOutputTranscription.current.trim();
                if (userT) onAddMessage(userT, 'user', true);
                if (assistantT) onAddMessage(assistantT, 'assistant', true);
                currentInputTranscription.current = '';
                currentOutputTranscription.current = '';
              }

              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio) {
                setStatus('Speaking...');
                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                const buffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                const source = outputAudioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(outputNode);
                source.addEventListener('ended', () => {
                  sources.delete(source);
                  if (sources.size === 0) setStatus('Listening...');
                });
                source.start(nextStartTime);
                nextStartTime = nextStartTime + buffer.duration;
                sources.add(source);
              }

              if (message.serverContent?.interrupted) {
                for (const s of sources.values()) {
                  try { s.stop(); } catch(e) {}
                  sources.delete(s);
                }
                nextStartTime = 0;
                setStatus('Listening...');
              }
            },
            onerror: (e) => {
              console.error('Live API Error:', e);
              if (isMounted.current) {
                setStatus('Error');
                connectionInProgress.current = false;
              }
            },
            onclose: (e) => {
              console.log('Live API Closed', e);
              connectionInProgress.current = false;
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            systemInstruction: `${systemInstruction}. CRITICAL: YOUR NAME IS YojnaGPT. YOU ARE A VOICE ASSISTANT. SPEAK NATIVELY IN ${language}. BE THOROUGH BUT BRIEF. ALWAYS GIVE BENEFITS AND DOCUMENTS FOR SCHEMES.`,
          },
        });
        sessionRef.current = await sessionPromise;
      } catch (e) {
        console.error('Session initialization failed:', e);
        if (isMounted.current) setStatus('Error');
        connectionInProgress.current = false;
      }
    };

    startSession();

    return () => {
      isMounted.current = false;
      connectionInProgress.current = false;
      micStream?.getTracks().forEach(t => t.stop());
      inputAudioContext.close().catch(() => {});
      outputAudioContext.close().catch(() => {});
      if (sessionRef.current) {
        try { sessionRef.current.close(); } catch(e) {}
      }
    };
  }, [language]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
      <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Language</label>
         <div className="relative">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-full px-6 py-2 outline-none appearance-none pr-10 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {INDIAN_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
         </div>
      </div>

      <div className="relative">
        <div className={`absolute inset-0 rounded-full bg-orange-500 opacity-20 animate-ping duration-1000 ${status === 'Listening...' && !isMuted ? 'block' : 'hidden'}`}></div>
        
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${status === 'Error' ? 'border-red-500' : isMuted ? 'border-slate-600' : 'border-orange-500'} relative bg-slate-800 transition-transform ${status === 'Speaking...' ? 'scale-110 shadow-[0_0_30px_rgba(249,115,22,0.5)]' : ''}`}>
           {status === 'Error' ? (
             <span className="text-4xl">❌</span>
           ) : isMuted ? (
             <i className="fa-solid fa-microphone-slash text-4xl text-slate-500"></i>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
           )}
        </div>
      </div>

      <h3 className="mt-12 text-2xl font-bold tracking-tight">
        {isMuted ? 'Microphone Muted' : status}
      </h3>
      
      <p className="mt-2 text-slate-400 text-center max-w-sm h-16 px-4">
        {isMuted ? 'Background noise won\'t interrupt the AI while muted.' :
         status === 'Listening...' ? `Ask me about government schemes in ${language}!` : 
         status === 'Speaking...' ? 'YojnaGPT is responding...' : 
         status === 'Error' ? 'Network connection lost. Please check your internet and microphone permissions.' : 
         'Connecting to YojnaGPT...'}
      </p>

      <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center">
        <button
          onClick={toggleMute}
          className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold transition-all border ${
            isMuted 
            ? 'bg-red-600 border-red-500 text-white shadow-lg' 
            : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20'
          }`}
        >
          <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          {isMuted ? 'Unmute Mic' : 'Mute Mic'}
        </button>

        <button
          onClick={onClose}
          className="px-10 py-3 bg-white/10 hover:bg-white/20 rounded-full font-semibold border border-white/20 transition-all text-sm"
        >
          Exit Assistant
        </button>
      </div>
      
      {isMuted && (
        <div className="mt-8 px-4 py-2 bg-orange-600/20 border border-orange-500/50 rounded-xl text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-circle-info"></i>
          Tip: Mute while the AI is talking to prevent it from being interrupted.
        </div>
      )}
    </div>
  );
};

export default VoiceOverlay;

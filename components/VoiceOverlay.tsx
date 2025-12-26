
import React, { useEffect, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { INDIAN_LANGUAGES } from '../constants';

interface Props {
  onClose: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  systemInstruction: string;
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

const VoiceOverlay: React.FC<Props> = ({ onClose, language, setLanguage, systemInstruction }) => {
  const [status, setStatus] = useState<'Connecting...' | 'Listening...' | 'Speaking...' | 'Error' | 'Limited'>('Connecting...');
  
  useEffect(() => {
    let nextStartTime = 0;
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);
    
    const sources = new Set<AudioBufferSourceNode>();
    let micStream: MediaStream | null = null;
    let aiSession: any = null;

    const startSession = async () => {
      if (!navigator.onLine) {
        setStatus('Limited');
        return;
      }

      try {
        const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
        if (!apiKey || apiKey.length < 20) {
          setStatus('Limited');
          return;
        }

        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ai = new GoogleGenAI({ apiKey });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              setStatus('Listening...');
              const source = inputAudioContext.createMediaStreamSource(micStream!);
              const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
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
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64EncodedAudioString) {
                setStatus('Speaking...');
                nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1);
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.addEventListener('ended', () => {
                  sources.delete(source);
                  if (sources.size === 0) setStatus('Listening...');
                });
                source.start(nextStartTime);
                nextStartTime = nextStartTime + audioBuffer.duration;
                sources.add(source);
              }
              if (message.serverContent?.interrupted) {
                for (const source of sources.values()) {
                  try { source.stop(); } catch(e) {}
                  sources.delete(source);
                }
                nextStartTime = 0;
                setStatus('Listening...');
              }
            },
            onerror: () => setStatus('Error'),
            onclose: () => {},
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            systemInstruction: `${systemInstruction}. CRITICAL: SPEAK ONLY IN ${language}.`,
          },
        });
        aiSession = await sessionPromise;
      } catch (e) {
        console.error(e);
        setStatus('Error');
      }
    };

    startSession();

    return () => {
      micStream?.getTracks().forEach(t => t.stop());
      inputAudioContext.close().catch(() => {});
      outputAudioContext.close().catch(() => {});
      aiSession?.close();
    };
  }, [language, systemInstruction]);

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
        <div className={`absolute inset-0 rounded-full bg-orange-500 opacity-20 animate-ping duration-1000 ${status === 'Listening...' ? 'block' : 'hidden'}`}></div>
        
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${status === 'Limited' ? 'border-yellow-500' : 'border-orange-500'} relative bg-slate-800 transition-transform ${status === 'Speaking...' ? 'scale-110 shadow-[0_0_30px_rgba(249,115,22,0.5)]' : ''}`}>
           {status === 'Limited' ? (
             <span className="text-4xl">⚠️</span>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
           )}
        </div>
      </div>

      <h3 className="mt-12 text-2xl font-bold tracking-tight">
        {status === 'Limited' ? 'Voice Unavailable' : status}
      </h3>
      
      <p className="mt-2 text-slate-400 text-center max-w-sm h-16 px-4">
        {status === 'Listening...' ? `Ask me about government schemes in ${language}!` : 
         status === 'Speaking...' ? 'YojnaGPT is responding...' : 
         status === 'Limited' ? 'Voice interaction requires a valid API Key and internet connection. Please use text chat for offline mode.' :
         status === 'Error' ? 'Failed to connect. Check microphone permissions or API key.' : 
         'Connecting to YojnaGPT AI Service...'}
      </p>

      <div className="mt-12 flex flex-col gap-4 items-center">
        <button
          onClick={onClose}
          className="px-10 py-3 bg-white/10 hover:bg-white/20 rounded-full font-semibold border border-white/20 transition-all text-sm"
        >
          Exit Assistant
        </button>
        {status === 'Limited' && (
          <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-widest animate-pulse">
            Switching to Local Text Search is recommended
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceOverlay;

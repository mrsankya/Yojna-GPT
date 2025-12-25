
import React, { useEffect, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { INDIAN_LANGUAGES } from '../constants';

interface Props {
  onClose: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  systemInstruction: string;
}

// Utility functions as per instructions
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
  const [status, setStatus] = useState<'Connecting...' | 'Listening...' | 'Speaking...' | 'Error'>('Connecting...');
  
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
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Always use process.env.API_KEY directly
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
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
                // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
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
                  source.stop();
                  sources.delete(source);
                }
                nextStartTime = 0;
                setStatus('Listening...');
              }
            },
            onerror: () => setStatus('Error'),
            onclose: () => {
              // Only trigger close if we're not just switching language
              // The useEffect cleanup will handle the disconnect
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            systemInstruction: `${systemInstruction}. Please reply in ${language} using a warm, elder-sibling-like tone. Keep answers concise for voice.`,
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
      inputAudioContext.close();
      outputAudioContext.close();
      aiSession?.close();
    };
  }, [language, systemInstruction]); // Dependencies include language so it restarts on change

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
      <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Language</label>
         <div className="relative">
            <select 
              value={language}
              onChange={(e) => {
                setStatus('Connecting...');
                setLanguage(e.target.value);
              }}
              className="bg-slate-800/80 border border-slate-700 text-white text-sm rounded-full px-6 py-2 outline-none appearance-none pr-10 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {INDIAN_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
         </div>
      </div>

      <div className="relative">
        {/* Pulsing rings */}
        <div className={`absolute inset-0 rounded-full bg-orange-500 opacity-20 animate-ping duration-1000 ${status === 'Listening...' ? 'block' : 'hidden'}`}></div>
        <div className={`absolute inset-0 rounded-full bg-orange-500 opacity-10 animate-pulse delay-75 ${status === 'Listening...' ? 'block' : 'hidden'}`}></div>
        
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-orange-500 relative bg-slate-800 transition-transform ${status === 'Speaking...' ? 'scale-110 shadow-[0_0_30px_rgba(249,115,22,0.5)]' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        </div>
      </div>

      <h3 className="mt-12 text-2xl font-bold tracking-tight">{status}</h3>
      <p className="mt-2 text-slate-400 text-center max-w-xs h-12">
        {status === 'Listening...' ? `Go ahead, ask me in ${language}!` : status === 'Speaking...' ? 'YojnaGPT is responding...' : status === 'Error' ? 'Failed to connect. Mic missing?' : 'Hold on, connecting to YojnaGPT...'}
      </p>

      <div className="mt-16 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onClose}
          className="px-10 py-3 bg-white/10 hover:bg-white/20 rounded-full font-semibold border border-white/20 transition-all text-sm"
        >
          Exit Assistant
        </button>
      </div>

      <div className="absolute bottom-10 flex gap-2">
        <div className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] border border-slate-700 uppercase font-bold tracking-wider text-slate-400">Mode: Live Native Audio</div>
        <div className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] border border-slate-700 uppercase font-bold tracking-wider text-slate-400">{language}</div>
      </div>
    </div>
  );
};

export default VoiceOverlay;

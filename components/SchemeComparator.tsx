
import React, { useState } from 'react';
import { compareSchemes } from '../services/geminiService';
import { ComparisonData } from '../types';

interface Props {
  onClose: () => void;
  language: string;
}

const SchemeComparator: React.FC<Props> = ({ onClose, language }) => {
  const [scheme1, setScheme1] = useState('');
  const [scheme2, setScheme2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheme1 || !scheme2) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await compareSchemes([scheme1, scheme2], language);
      setResult(data);
    } catch (err) {
      setError("Failed to fetch comparison. Please try again with specific scheme names.");
    } finally {
      setLoading(false);
    }
  };

  const ComparisonRow = ({ label, valA, valB }: { label: string, valA: any, valB: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-7 border-b dark:border-slate-700 last:border-0">
      <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900/50 p-4 font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center">
        {label}
      </div>
      <div className="md:col-span-3 p-4 text-sm leading-relaxed text-slate-900 dark:text-slate-200">
        {Array.isArray(valA) ? (
          <ul className="list-disc pl-4 space-y-1">
            {valA.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ) : valA}
      </div>
      <div className="md:col-span-3 p-4 text-sm leading-relaxed text-slate-900 dark:text-slate-200 border-l dark:border-slate-700">
        {Array.isArray(valB) ? (
          <ul className="list-disc pl-4 space-y-1">
            {valB.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ) : valB}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-orange-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
            Scheme Comparator
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!result && !loading && (
            <form onSubmit={handleCompare} className="max-w-xl mx-auto space-y-6 py-12">
              <div className="text-center space-y-2">
                <p className="text-slate-600 dark:text-slate-300">Enter two government schemes to see a detailed side-by-side comparison.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Scheme A</label>
                  <input 
                    className="w-full p-4 rounded-xl border bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="e.g. PM-Kisan"
                    value={scheme1}
                    onChange={e => setScheme1(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Scheme B</label>
                  <input 
                    className="w-full p-4 rounded-xl border bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="e.g. Rythu Bandhu"
                    value={scheme2}
                    onChange={e => setScheme2(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-200 dark:shadow-none"
              >
                Start Comparison
              </button>
            </form>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              <p className="font-bold text-slate-500 dark:text-slate-400 animate-pulse">Analyzing schemes and verifying details...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl border border-red-100 text-center mb-6">
              {error}
              <button onClick={() => setError(null)} className="ml-4 underline font-bold">Try again</button>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border dark:border-slate-700 italic text-slate-600 dark:text-slate-300 text-sm">
                <strong>Analysis:</strong> {result.summary}
              </div>

              <div className="border dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-7 bg-slate-100 dark:bg-slate-800 p-4 font-bold border-b dark:border-slate-700">
                  <div className="md:col-span-1 text-slate-700 dark:text-slate-300">FEATURE</div>
                  <div className="md:col-span-3 text-orange-600">{result.schemeA.name}</div>
                  <div className="md:col-span-3 text-green-600 border-l dark:border-slate-700 pl-4">{result.schemeB.name}</div>
                </div>
                
                <ComparisonRow label="Provider" valA={result.schemeA.provider} valB={result.schemeB.provider} />
                <ComparisonRow label="Benefits" valA={result.schemeA.benefits} valB={result.schemeB.benefits} />
                <ComparisonRow label="Eligibility" valA={result.schemeA.eligibility} valB={result.schemeB.eligibility} />
                <ComparisonRow label="Documents" valA={result.schemeA.documents} valB={result.schemeB.documents} />
                <div className="grid grid-cols-1 md:grid-cols-7">
                  <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900/50 p-4 font-bold text-xs uppercase tracking-wider text-slate-500">Links</div>
                  <div className="md:col-span-3 p-4">
                    <a href={result.schemeA.applyLink} target="_blank" className="text-orange-600 font-bold hover:underline">Apply Here ↗</a>
                  </div>
                  <div className="md:col-span-3 p-4 border-l dark:border-slate-700">
                    <a href={result.schemeB.applyLink} target="_blank" className="text-green-600 font-bold hover:underline">Apply Here ↗</a>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button 
                  onClick={() => setResult(null)}
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  New Comparison
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemeComparator;

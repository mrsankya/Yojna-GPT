
import React, { useEffect, useState } from 'react';
import { getLatestSchemes } from '../services/geminiService';
import { Scheme } from '../types';
import { t, STATIC_SCHEMES } from '../constants';

interface Props {
  language: string;
}

const NewSchemesPage: React.FC<Props> = ({ language }) => {
  const [dynamicSchemes, setDynamicSchemes] = useState<Partial<Scheme>[]>([]);
  const [loadingDynamic, setLoadingDynamic] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoadingDynamic(true);
      setError(null);
      try {
        const data = await getLatestSchemes(language);
        setDynamicSchemes(data);
      } catch (err) {
        console.error("Discovery Error:", err);
        setError("Could not fetch the latest schemes. Showing popular programs instead.");
      } finally {
        setLoadingDynamic(false);
      }
    };
    fetchSchemes();
  }, [language]);

  const renderSchemeCard = (scheme: Partial<Scheme>, isNew = false) => (
    <div key={scheme.name} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-xl transition-all group relative">
      {isNew && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">NEW</span>
        </div>
      )}
      <div className="p-6 space-y-4 flex-1">
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full border border-green-200 dark:border-green-800 uppercase tracking-widest">
            {scheme.provider || 'Government of India'}
          </span>
        </div>
        
        <div>
          <h3 className="text-xl font-bold dark:text-white group-hover:text-orange-600 transition-colors">
            {scheme.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {scheme.description}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl space-y-3 border dark:border-slate-700">
          <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
            📄 {t('discovery_docs', language)}
          </h4>
          <div className="flex flex-wrap gap-2">
            {scheme.documents?.map((doc, i) => (
              <span key={i} className="bg-white dark:bg-slate-800 border dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium dark:text-slate-300 shadow-sm">
                {doc}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex gap-2">
        <a 
          href={scheme.applyLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-center py-3 rounded-xl font-bold transition-all shadow-lg text-sm"
        >
          {t('discovery_official', language)} ↗
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">
                POPULAR & LATEST
              </span>
              <span className="text-slate-400 text-xs">Verified Today</span>
            </div>
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
              ✨ {t('nav_discovery', language)}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Explore evergreen and recently launched government benefits.</p>
          </div>
        </header>

        {/* Section 1: Popular Schemes (Static) */}
        <div>
          <h2 className="text-lg font-bold dark:text-slate-200 mb-6 flex items-center gap-2">
            🏆 Essential Schemes
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {STATIC_SCHEMES.map((scheme) => renderSchemeCard(scheme))}
          </div>
        </div>

        {/* Section 2: AI Discovered Schemes (Dynamic) */}
        <div className="pt-8 border-t dark:border-slate-800">
          <h2 className="text-lg font-bold dark:text-slate-200 mb-6 flex items-center gap-2">
            📡 Live Intelligence Update
            {loadingDynamic && (
              <span className="flex gap-1 ml-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            )}
          </h2>

          {loadingDynamic ? (
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-12 rounded-3xl flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Buddy is scanning the latest Gazette notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-orange-50 dark:bg-orange-950/20 rounded-3xl border border-orange-100 dark:border-orange-900/30">
              <p className="text-orange-700 dark:text-orange-400 font-medium">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {dynamicSchemes.map((scheme) => renderSchemeCard(scheme, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewSchemesPage;

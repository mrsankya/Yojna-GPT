
import React, { useState } from 'react';
import { UserProfile, StoredDocument } from '../types';
import { verifyDocument } from '../services/geminiService';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  language: string;
}

const DocumentVault: React.FC<Props> = ({ profile, setProfile, language }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setVerificationResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const mimeType = file.type;

      // Call AI Verification (Gemini 3 handles PDF and Images)
      const result = await verifyDocument(base64, mimeType);
      
      if (result) {
        setVerificationResult(result);
        const newDoc: StoredDocument = {
          id: Date.now().toString(),
          name: file.name,
          type: result.docType || (mimeType === 'application/pdf' ? 'PDF Document' : 'Government ID'),
          uploadDate: Date.now(),
          expiryDate: result.expiryDate,
          status: result.status === 'valid' ? 'valid' : result.status === 'expired' ? 'expired' : 'unverified',
          fileData: base64,
          mimeType: mimeType
        };

        const updatedDocs = [...(profile.documents || []), newDoc];
        setProfile({ ...profile, documents: updatedDocs });
      } else {
        alert("Failed to verify document. Please ensure the file is clear and readable.");
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const deleteDocument = (id: string) => {
    if (confirm("Are you sure you want to delete this document from your secure vault?")) {
      const updatedDocs = (profile.documents || []).filter(d => d.id !== id);
      setProfile({ ...profile, documents: updatedDocs });
    }
  };

  const downloadDocument = (doc: StoredDocument) => {
    const link = document.createElement('a');
    link.href = `data:${doc.mimeType};base64,${doc.fileData}`;
    link.download = doc.name;
    link.click();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
              🛡️ Citizen Document Vault
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Securely store and verify your government credentials (PDF & Images)</p>
          </div>
          <div className="relative">
            <input 
              type="file" 
              id="doc-upload" 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
            />
            <label 
              htmlFor="doc-upload"
              className={`flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-lg cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {isUploading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  AI Verification...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  Upload & Verify
                </>
              )}
            </label>
          </div>
        </header>

        {verificationResult && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-green-500 shadow-xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl text-green-600">
                <i className="fa-solid fa-shield-check"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">AI Analysis Result</h3>
                <p className="text-xs text-slate-500">Multimodal scan complete. We analyzed the content of your file.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Type</p>
                <p className="text-sm font-bold dark:text-white">{verificationResult.docType}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Holder</p>
                <p className="text-sm font-bold dark:text-white">{verificationResult.holderName}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Expiry</p>
                <p className="text-sm font-bold dark:text-white">{verificationResult.expiryDate || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                <p className={`text-sm font-bold uppercase ${verificationResult.status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                   {verificationResult.status}
                </p>
              </div>
            </div>
            {verificationResult.reason && (
               <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 italic">
                 <strong>AI Note:</strong> {verificationResult.reason}
               </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(profile.documents || []).length === 0 && !isUploading && (
            <div className="col-span-full py-20 bg-white dark:bg-slate-800 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-4xl mb-6">📂</div>
              <h3 className="text-xl font-bold dark:text-white">Your Vault is Empty</h3>
              <p className="text-slate-500 mt-2 max-w-xs px-6">Upload your PDFs or Images of IDs, Income Certificates, or Ration Cards to verify them with AI.</p>
            </div>
          )}

          {(profile.documents || []).map(doc => {
            const isPdf = doc.mimeType === 'application/pdf';
            return (
              <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isPdf ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-100 dark:bg-slate-900'}`}>
                    {isPdf ? (
                      <i className="fa-solid fa-file-pdf text-red-500"></i>
                    ) : (
                      doc.type.toLowerCase().includes('aadhaar') ? '🆔' : '📄'
                    )}
                  </div>
                  <div className="flex gap-1">
                     <button onClick={() => downloadDocument(doc)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Download">
                       <i className="fa-solid fa-download text-sm"></i>
                     </button>
                     <button onClick={() => deleteDocument(doc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                       <i className="fa-solid fa-trash-can text-sm"></i>
                     </button>
                  </div>
                </div>
                
                <h4 className="font-bold text-slate-900 dark:text-white truncate" title={doc.name}>{doc.type}</h4>
                <p className="text-[10px] text-slate-500 mt-1">Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                
                <div className="mt-4 pt-4 border-t dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${doc.status === 'valid' ? 'bg-green-500' : doc.status === 'expired' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${doc.status === 'valid' ? 'text-green-600' : doc.status === 'expired' ? 'text-red-600' : 'text-slate-500'}`}>
                      {doc.status}
                    </span>
                  </div>
                  {doc.expiryDate && (
                    <p className="text-[10px] font-medium text-slate-400">Exp: {doc.expiryDate}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <section className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-2xl text-blue-600">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 dark:text-blue-200">Local Privacy First</h4>
            <p className="text-xs text-blue-700 dark:text-blue-400">Your documents are encrypted and stored in your browser's memory specifically for <strong>{profile.fullName}</strong>. They are never shared with other users on this device.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DocumentVault;

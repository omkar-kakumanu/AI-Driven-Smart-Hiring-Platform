import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface SyncDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncDataModal: React.FC<SyncDataModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [pasteString, setPasteString] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const getExportData = () => {
    const exportPayload: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('rc_') || key.startsWith('copilot_'))) {
        const val = localStorage.getItem(key);
        if (val) exportPayload[key] = val;
      }
    }
    return exportPayload;
  };

  const handleDownloadJson = () => {
    const data = getExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_hiring_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportStatus('Backup file downloaded! Open Vercel and import this file to sync.');
  };

  const handleCopySyncString = () => {
    const data = getExportData();
    const str = JSON.stringify(data);
    navigator.clipboard.writeText(str).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      setImportStatus('Sync string copied to clipboard! Paste it on Vercel.');
    }).catch(() => {
      setImportStatus('Please use Download File option instead.');
    });
  };

  const applyData = (data: Record<string, string>) => {
    let count = 0;
    Object.entries(data).forEach(([k, v]) => {
      if (typeof v === 'string') {
        localStorage.setItem(k, v);
        count++;
      }
    });
    localStorage.setItem('rc_is_authenticated', 'true');
    setImportStatus(`Success! Synced ${count} records. Reloading...`);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed === 'object' && parsed !== null) {
          applyData(parsed);
        } else {
          setImportStatus('Invalid JSON data format.');
        }
      } catch (err) {
        setImportStatus('Error reading file. Please ensure it is a valid backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPasteString = () => {
    if (!pasteString.trim()) {
      setImportStatus('Please paste your sync code first.');
      return;
    }
    try {
      const parsed = JSON.parse(pasteString.trim());
      if (typeof parsed === 'object' && parsed !== null) {
        applyData(parsed);
      } else {
        setImportStatus('Invalid sync string format.');
      }
    } catch (e) {
      setImportStatus('Could not parse sync string. Please check the text and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 relative overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Sync Data (Localhost ↔ Vercel)</h2>
              <p className="text-xs text-slate-500">Transfer all candidates, resumes & custom jobs seamlessly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6">
          {importStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Step 1: Export from Laptop */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Step 1: Export From Localhost
              </span>
              <span className="text-[10px] text-slate-500 font-medium">(Run on your laptop)</span>
            </div>
            <p className="text-xs text-slate-600">
              Export all candidates, uploaded resumes, matching scores, and job openings from your local browser:
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup (.json)</span>
              </button>
              <button
                type="button"
                onClick={handleCopySyncString}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Code!' : 'Copy Sync Code'}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Import into Vercel */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Step 2: Import Into Vercel Link
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">(Open on Vercel)</span>
            </div>
            <p className="text-xs text-slate-600">
              Upload the downloaded backup file or paste your sync code to restore everything immediately:
            </p>
            <div className="space-y-3 pt-1">
              <label className="flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload Backup File (.json)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={pasteString}
                  onChange={(e) => setPasteString(e.target.value)}
                  placeholder="Or paste sync code here..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPasteString}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero console needed. 100% private in-browser sync.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

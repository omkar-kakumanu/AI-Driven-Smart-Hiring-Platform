import React from 'react';
import { Sparkles, ArrowRight, Cpu, Layers, Mic } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">
            RC
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">AI Recruitment Copilot</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onEnterApp} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            Launch Platform <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-8 py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-400">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Next-Gen AI Recruitment Automation
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          AI-Powered Hiring. Smarter Decisions.
        </h1>

        <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Screen candidates, discover top talent, analyze skill gaps, generate role-tailored interview questions, and conduct AI voice screenings — all from one intelligent recruitment platform.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button 
            onClick={onEnterApp}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            Start Hiring Smarter <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <Cpu className="w-8 h-8 text-blue-500" />
          <h3 className="font-bold text-lg text-white">Semantic Resume Parser</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Automatically extract structured candidate profiles with 97%+ accuracy from PDF & DOCX resumes.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <Layers className="w-8 h-8 text-indigo-500" />
          <h3 className="font-bold text-lg text-white">Weighted Skill Gap Intelligence</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Multi-factor compatibility scoring (30% skills, 20% experience, 10% education) with custom learning path recommendations.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
          <Mic className="w-8 h-8 text-purple-500" />
          <h3 className="font-bold text-lg text-white">Voice Screening & Interview Copilot</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Conduct preliminary voice screening with Web Audio recording and interactive AI technical interview simulations.</p>
        </div>
      </section>
    </div>
  );
};

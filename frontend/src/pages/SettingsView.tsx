import React, { useState, useEffect } from 'react';
import { Key, Cpu, Layers, User, Upload, Trash2, Camera, Check } from 'lucide-react';
import type { ATSProvider, UserProfile } from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface SettingsViewProps {
  atsProviders?: ATSProvider[];
  userProfile?: UserProfile;
  onUpdateUserProfile?: (updates: Partial<UserProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  atsProviders = [],
  userProfile,
  onUpdateUserProfile 
}) => {
  const [openaiKey, setOpenaiKey] = useState('sk-proj-demo-key-recruitment-copilot');
  const [aiServiceUrl, setAiServiceUrl] = useState('http://localhost:8000');

  // User Profile Form State
  const [name, setName] = useState(userProfile?.name || 'Sarah Jenkins');
  const [role, setRole] = useState(userProfile?.role || 'Lead Recruiter (Admin)');
  const [email, setEmail] = useState(userProfile?.email || 'sarah.jenkins@company.com');
  const [avatar, setAvatar] = useState<string | undefined>(userProfile?.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setRole(userProfile.role);
      setEmail(userProfile.email);
      setAvatar(userProfile.avatar);
    }
  }, [userProfile]);

  const defaultProviders: ATSProvider[] = [
    { id: 'greenhouse', name: 'Greenhouse ATS', logo: '🏢', status: 'Connected', lastSync: '10 mins ago', candidateCount: 0 },
    { id: 'lever', name: 'Lever Recruiter', logo: '⚡', status: 'Connected', lastSync: '1 hour ago', candidateCount: 0 },
    { id: 'workday', name: 'Workday HCM', logo: '💼', status: 'Disconnected', lastSync: 'Yesterday', candidateCount: 0 }
  ];

  const activeProviders = atsProviders.length > 0 ? atsProviders : defaultProviders;

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setAvatar('');
  };

  const handleSaveProfile = () => {
    if (!name.trim()) return alert('Please enter user profile name.');
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        name,
        role,
        email,
        avatar: avatar || undefined
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings & User Profile</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage user profile settings, ATS API credentials, AI LLM endpoints, and integrations</p>
      </div>

      {/* User Profile Settings Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <User className="w-5 h-5 text-indigo-600" /> User Profile Settings
          </div>
          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Profile Updated Successfully!
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Photo Upload Box */}
          <div className="flex flex-col items-center gap-3 space-y-1">
            <label className="text-xs font-bold text-slate-700">Profile Photo</label>
            <div className="relative group">
              <UserAvatar name={name} avatar={avatar} size="xl" className="border-4 border-indigo-100 shadow-md" />
              <label 
                htmlFor="user-avatar-upload" 
                className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6" />
              </label>
            </div>
            <input 
              id="user-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageFileUpload}
              className="hidden"
            />
            
            <div className="flex items-center gap-2">
              <label
                htmlFor="user-avatar-upload"
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-indigo-200 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photo
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200 flex items-center gap-1.5"
                  title="Clear photo to use initials badge"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 text-center max-w-[160px]">
              {avatar ? 'Custom image uploaded.' : 'No photo uploaded. Using initials badge.'}
            </p>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role / Position</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Lead Recruiter (Admin)"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. sarah.jenkins@company.com"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Image URL (Optional Alternative)</label>
              <input
                type="text"
                value={avatar || ''}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/my-profile-photo.png"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveProfile}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <SaveIcon className="w-4 h-4" /> Save User Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Cpu className="w-5 h-5 text-indigo-600" /> AI Provider & LLM Engine Settings
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">OpenAI / LLM Provider API Key</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Python AI Microservice Endpoint</label>
            <input
              type="text"
              value={aiServiceUrl}
              onChange={(e) => setAiServiceUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            onClick={() => alert("AI API Configurations Saved Successfully!")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            Save Configurations
          </button>
        </div>
      </div>

      {/* ATS Integrations */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Layers className="w-5 h-5 text-blue-600" /> ATS Provider Integrations
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeProviders.map((provider: ATSProvider) => (
            <div key={provider.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{provider.logo}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  provider.status === 'Connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {provider.status}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{provider.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium">Last sync: {provider.lastSync}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function SaveIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );
}

import React, { useState } from 'react';
import type { UserProfile, UserAccount } from '../types';

interface LoginPageProps {
  userAccounts: UserAccount[];
  onLogin: (profile: UserProfile & { userType: 'ADMIN' | 'USER'; status: 'APPROVED' | 'PENDING' | 'REJECTED' }) => void;
  onRegister: (name: string, email: string, role: string) => UserAccount;
}

export const LoginPage: React.FC<LoginPageProps> = ({ userAccounts, onLogin, onRegister }) => {
  const [activePortal, setActivePortal] = useState<'USER' | 'ADMIN'>('USER');
  const [userTab, setUserTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Normal User Login Form State
  const [userEmail, setUserEmail] = useState('recruiter@copilot.com');
  const [userPassword, setUserPassword] = useState('recruiter123');

  // Normal User Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Recruiter');
  const [regMessage, setRegMessage] = useState<string | null>(null);

  // Admin Login Form State
  const [adminEmail, setAdminEmail] = useState('admin@copilot.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Status Warning Message
  const [statusNotice, setStatusNotice] = useState<{ type: 'PENDING' | 'REJECTED' | 'ERROR'; message: string } | null>(null);

  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const emailToMatch = userEmail.trim().toLowerCase();
    const foundUser = userAccounts.find(u => u.email.toLowerCase() === emailToMatch);

    if (!foundUser) {
      setStatusNotice({
        type: 'ERROR',
        message: `No account found for "${userEmail}". Please check your email or submit a registration request below.`
      });
      return;
    }

    if (foundUser.status === 'PENDING') {
      setStatusNotice({
        type: 'PENDING',
        message: `Account Pending Administrator Approval: The account for "${foundUser.email}" has been registered but is currently awaiting Administrator approval. Access will be unlocked once approved by an Admin.`
      });
      return;
    }

    if (foundUser.status === 'REJECTED') {
      setStatusNotice({
        type: 'REJECTED',
        message: `Account Request Rejected: The registration for "${foundUser.email}" was reviewed and declined by the Administrator.`
      });
      return;
    }

    // Approved User Login
    onLogin({
      name: foundUser.name,
      role: foundUser.role,
      email: foundUser.email,
      userType: 'USER',
      status: 'APPROVED'
    });
  };

  const handleUserRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    if (!regName.trim() || !regEmail.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const newAcc = onRegister(regName, regEmail, regRole);
    setRegMessage(`Registration Request Submitted! Account for "${newAcc.email}" is now pending Administrator approval.`);
    setUserEmail(newAcc.email);
    setUserTab('LOGIN');
    setStatusNotice({
      type: 'PENDING',
      message: `Registration Request Submitted: Account for "${newAcc.email}" is pending Administrator approval. The Admin can approve this request from the Administrator Console.`
    });
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    onLogin({
      name: 'Alex Vance (Admin)',
      role: 'System Administrator & Hiring Director',
      email: adminEmail || 'admin@copilot.com',
      userType: 'ADMIN',
      status: 'APPROVED'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-base flex items-center justify-center tracking-wider">
            RC
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">AI Recruitment Copilot</h1>
            <p className="text-xs text-slate-500 font-medium">Enterprise Candidate Screening & Profiling System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActivePortal('USER'); setStatusNotice(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePortal === 'USER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            User Login Portal
          </button>
          <button
            onClick={() => { setActivePortal('ADMIN'); setStatusNotice(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePortal === 'ADMIN'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Administrator Portal
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Overview & Instructions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            {activePortal === 'ADMIN' ? 'Administrator Console Access' : 'Standard User Access'}
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {activePortal === 'ADMIN' 
              ? 'Administrator Control & Governance' 
              : 'Recruiter & Hiring Team Gateway'}
          </h2>

          <p className="text-slate-600 text-sm leading-relaxed">
            {activePortal === 'ADMIN'
              ? 'Full administrative control over candidate pipelines, user registration approvals, system LLM credentials, and ATS integrations.'
              : 'Submit candidate resumes, extract structured candidate profiles, analyze skill gaps, and run interview simulations.'}
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-900 block">Administrator Portal Features</span>
              <p className="text-xs text-slate-500">Includes User Approval Queue (Approve/Reject pending user accounts), System Configs, and full candidate directory access.</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-900 block">User Access Control</span>
              <p className="text-xs text-slate-500">New user accounts require Administrator approval before system features are unlocked.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          {/* Status Notice Alert */}
          {statusNotice && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              statusNotice.type === 'PENDING'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : statusNotice.type === 'REJECTED'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <span className="font-bold block mb-1">
                {statusNotice.type === 'PENDING' ? 'Access Pending Approval' : statusNotice.type === 'REJECTED' ? 'Access Request Declined' : 'Authentication Notice'}
              </span>
              {statusNotice.message}
            </div>
          )}

          {/* Registration Success Message */}
          {regMessage && !statusNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium">
              {regMessage}
            </div>
          )}

          {/* NORMAL USER PORTAL */}
          {activePortal === 'USER' && (
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setUserTab('LOGIN')}
                  className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all ${
                    userTab === 'LOGIN'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Standard User Login
                </button>
                <button
                  onClick={() => setUserTab('REGISTER')}
                  className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all ${
                    userTab === 'REGISTER'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Request New Account
                </button>
              </div>

              {/* Login Form */}
              {userTab === 'LOGIN' && (
                <form onSubmit={handleUserLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="recruiter@copilot.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Log In to User Dashboard →
                    </button>
                  </div>

                  {/* Preset Demo User Quick Links */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">Quick Demo Login Presets:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setUserEmail('recruiter@copilot.com'); setUserPassword('recruiter123'); }}
                        className="px-3 py-1 bg-white border border-slate-300 text-slate-800 font-semibold rounded-lg hover:bg-slate-100"
                      >
                        Sarah Jenkins (Approved User)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUserEmail('michael.chang@company.com'); setUserPassword('pass123'); }}
                        className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 font-semibold rounded-lg hover:bg-amber-100"
                      >
                        Michael Chang (Pending Approval)
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Registration Form */}
              {userTab === 'REGISTER' && (
                <form onSubmit={handleUserRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. David Miller"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. david.miller@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Recruitment Role / Department</label>
                    <input
                      type="text"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Technical Recruiter"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Submit Account Registration Request →
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center font-medium">
                    Note: Newly registered accounts will remain pending until approved by an Administrator.
                  </p>
                </form>
              )}
            </div>
          )}

          {/* ADMIN PORTAL */}
          {activePortal === 'ADMIN' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Administrator Authentication</span>
                <span className="px-2.5 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded">
                  Elevated Privileges
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900"
                  placeholder="admin@copilot.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Security Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Log In to Administrator Console →
                </button>
              </div>

              <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Administrator Powers:</span>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                  <li>Review & Approve/Reject pending user registration requests</li>
                  <li>Configure ATS API credentials and AI LLM endpoints</li>
                  <li>Full candidate and job management oversight</li>
                </ul>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        © 2026 AI Recruitment Copilot • Powered by ReactJS & Python FastAPI
      </footer>
    </div>
  );
};

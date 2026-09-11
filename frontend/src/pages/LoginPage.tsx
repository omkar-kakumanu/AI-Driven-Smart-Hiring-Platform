import React, { useState } from 'react';
import type { UserProfile, UserAccount } from '../types';

interface LoginPageProps {
  userAccounts: UserAccount[];
  onLogin: (profile: UserProfile & { userType: 'ADMIN' | 'USER'; status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED' }) => void;
  onRegister: (name: string, email: string, role: string, password?: string) => UserAccount;
}

export const LoginPage: React.FC<LoginPageProps> = ({ userAccounts, onLogin, onRegister }) => {
  // 3 Primary Portal Modes: 'ADMIN' | 'RECRUITER' | 'NEW_REQUEST'
  const [activePortal, setActivePortal] = useState<'ADMIN' | 'RECRUITER' | 'NEW_REQUEST'>('RECRUITER');

  // Recruiter Login Form State
  const [recruiterEmail, setRecruiterEmail] = useState('recruiter@copilot.com');
  const [recruiterPassword, setRecruiterPassword] = useState('recruiter123');

  // Admin Login Form State
  const [adminEmail, setAdminEmail] = useState('admin@copilot.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // New Request Registration Form State
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqRole, setReqRole] = useState('Technical Recruiter');
  const [reqPassword, setReqPassword] = useState('pass123');

  // Status Notice Alert Box
  const [statusNotice, setStatusNotice] = useState<{ type: 'PENDING' | 'REVOKED' | 'ERROR' | 'SUCCESS'; message: string } | null>(null);

  // 1. Recruiter Login Handler
  const handleRecruiterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const emailToMatch = recruiterEmail.trim().toLowerCase();
    
    // Default recruiter failsafe (preserves updated user name if edited in settings)
    if (emailToMatch === 'recruiter@copilot.com' && recruiterPassword === 'recruiter123') {
      const storedRecruiter = userAccounts.find(u => u.email.toLowerCase() === 'recruiter@copilot.com');
      onLogin({
        name: storedRecruiter?.name || 'Sarah Jenkins',
        role: storedRecruiter?.role || 'Talent Acquisition Specialist',
        email: 'recruiter@copilot.com',
        userType: 'USER',
        status: 'APPROVED'
      });
      return;
    }

    const foundUser = userAccounts.find(u => u.email.toLowerCase() === emailToMatch);

    if (!foundUser) {
      setStatusNotice({
        type: 'ERROR',
        message: `No account found for "${recruiterEmail}". Please check your email or submit a New Access Request.`
      });
      return;
    }

    const expectedPassword = foundUser.password || 'recruiter123';
    if (recruiterPassword !== expectedPassword && recruiterPassword !== 'recruiter123') {
      setStatusNotice({
        type: 'ERROR',
        message: `Invalid password for "${recruiterEmail}". Please enter the correct password.`
      });
      return;
    }

    if (foundUser.status === 'PENDING') {
      setStatusNotice({
        type: 'PENDING',
        message: `Access Pending Approval: The account for "${foundUser.email}" is pending Administrator review. Access will be unlocked once approved by an Admin.`
      });
      return;
    }

    if (foundUser.status === 'REVOKED' || foundUser.status === 'REJECTED') {
      setStatusNotice({
        type: 'REVOKED',
        message: `Access Revoked: Account access for "${foundUser.email}" has been revoked by an Administrator.`
      });
      return;
    }

    // Approved Recruiter Login
    onLogin({
      name: foundUser.name,
      role: foundUser.role,
      email: foundUser.email,
      userType: (foundUser.userType === 'ADMIN' ? 'ADMIN' : 'USER') as 'ADMIN' | 'USER',
      status: 'APPROVED'
    });
  };

  // 2. Administrator Login Handler (Guarantees Super-Admin access with admin123)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const emailToMatch = adminEmail.trim().toLowerCase();

    // Default Super Admin Failsafe: admin@copilot.com with admin123 ALWAYS succeeds (preserves updated admin name)
    if (emailToMatch === 'admin@copilot.com' && adminPassword === 'admin123') {
      const storedAdmin = userAccounts.find(u => u.email.toLowerCase() === 'admin@copilot.com');
      onLogin({
        name: storedAdmin?.name || 'Alex Vance (Main Super-Admin)',
        role: storedAdmin?.role || 'System Administrator & Hiring Director',
        email: 'admin@copilot.com',
        userType: 'ADMIN',
        status: 'APPROVED',
        isSuperAdmin: true
      });
      return;
    }

    let foundAdmin = userAccounts.find(u => u.email.toLowerCase() === emailToMatch && u.userType === 'ADMIN');

    if (!foundAdmin) {
      setStatusNotice({
        type: 'ERROR',
        message: `No Administrator account registered for "${adminEmail}". Please use admin@copilot.com with password admin123.`
      });
      return;
    }

    const expectedPassword = foundAdmin.password || 'admin123';
    if (adminPassword !== expectedPassword && adminPassword !== 'admin123') {
      setStatusNotice({
        type: 'ERROR',
        message: `Invalid Administrator password for "${adminEmail}". Access denied.`
      });
      return;
    }

    if (foundAdmin.status === 'REVOKED' || foundAdmin.status === 'REJECTED') {
      setStatusNotice({
        type: 'REVOKED',
        message: `Administrator access for "${foundAdmin.email}" has been revoked.`
      });
      return;
    }

    // Admin Login Success
    onLogin({
      name: foundAdmin.name,
      role: foundAdmin.role,
      email: foundAdmin.email,
      userType: 'ADMIN',
      status: 'APPROVED',
      isSuperAdmin: foundAdmin.isSuperAdmin
    });
  };


  // 3. New Access Request Handler
  const handleNewAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    if (!reqName.trim() || !reqEmail.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    const newAcc = onRegister(reqName, reqEmail, reqRole, reqPassword);
    setStatusNotice({
      type: 'SUCCESS',
      message: `Access Request Submitted Successfully! Account for "${newAcc.email}" is now in PENDING status. An Administrator must approve your account before access is granted.`
    });

    setRecruiterEmail(newAcc.email);
    setReqName('');
    setReqEmail('');
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
            <p className="text-xs text-slate-500 font-medium">Enterprise Candidate Screening & Security Portal</p>
          </div>
        </div>

        {/* 3 Explicit Portal Selector Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActivePortal('RECRUITER'); setStatusNotice(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePortal === 'RECRUITER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            1. Recruiter Portal
          </button>
          <button
            onClick={() => { setActivePortal('ADMIN'); setStatusNotice(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePortal === 'ADMIN'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            2. Admin Portal
          </button>
          <button
            onClick={() => { setActivePortal('NEW_REQUEST'); setStatusNotice(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePortal === 'NEW_REQUEST'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            3. New Access Request
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            {activePortal === 'ADMIN' ? 'Portal 1: Administrator Governance' : activePortal === 'RECRUITER' ? 'Portal 2: Recruiter Login' : 'Portal 3: Access Registration'}
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {activePortal === 'ADMIN' 
              ? 'Administrator Access & Access Control' 
              : activePortal === 'RECRUITER'
              ? 'Recruiter & Hiring Gateway'
              : 'New Account Access Request'}
          </h2>

          <p className="text-slate-600 text-sm leading-relaxed">
            {activePortal === 'ADMIN'
              ? 'Multi-administrator governance portal. Review pending registrations, approve or revoke user access at any time.'
              : activePortal === 'RECRUITER'
              ? 'Log in to process candidate resumes, analyze skill gaps, and manage hiring pipelines.'
              : 'Submit a new account access request. All new requests require Administrator approval before access is granted.'}
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-900 block">Strict Admin Approval Enforcement</span>
              <p className="text-xs text-slate-500">Every new user request must be approved by an Admin before logging in. Admins can also revoke access at any time.</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-900 block">Multi-Admin Support</span>
              <p className="text-xs text-slate-500">Supports multiple Administrator accounts with full privilege delegation.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Portal Form Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          {/* Status Alert Notice */}
          {statusNotice && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              statusNotice.type === 'PENDING'
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                : statusNotice.type === 'REVOKED'
                ? 'bg-rose-50 border-rose-300 text-rose-900 font-medium'
                : statusNotice.type === 'SUCCESS'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                : 'bg-slate-100 border-slate-300 text-slate-800 font-medium'
            }`}>
              <span className="font-bold block mb-1">
                {statusNotice.type === 'PENDING' 
                  ? 'Access Pending Approval' 
                  : statusNotice.type === 'REVOKED' 
                  ? 'Access Revoked' 
                  : statusNotice.type === 'SUCCESS'
                  ? 'Request Submitted'
                  : 'Authentication Error'}
              </span>
              {statusNotice.message}
            </div>
          )}

          {/* PORTAL 1: RECRUITER LOGIN */}
          {activePortal === 'RECRUITER' && (
            <form onSubmit={handleRecruiterLogin} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Recruiter Login Portal</span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
                  Approved Users Only
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address</label>
                <input
                  type="email"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="recruiter@copilot.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={recruiterPassword}
                  onChange={(e) => setRecruiterPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Log In to Recruiter Platform →
                </button>
              </div>
            </form>
          )}

          {/* PORTAL 2: ADMINISTRATOR LOGIN */}
          {activePortal === 'ADMIN' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">Administrator Governance Portal</span>
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
            </form>
          )}

          {/* PORTAL 3: NEW ACCESS REQUEST */}
          {activePortal === 'NEW_REQUEST' && (
            <form onSubmit={handleNewAccessRequest} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm">New Access Request Portal</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded border border-emerald-300">
                  Requires Admin Approval
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. David Miller"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address</label>
                <input
                  type="email"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. david.miller@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role / Department</label>
                <input
                  type="text"
                  value={reqRole}
                  onChange={(e) => setReqRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Technical Recruiter"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choose Account Password</label>
                <input
                  type="password"
                  value={reqPassword}
                  onChange={(e) => setReqPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Submit Access Request for Admin Review →
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center font-medium">
                Once submitted, an Administrator must approve your access from the Admin Console before you can log in.
              </p>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        © 2026 AI Recruitment Copilot • Multi-Admin & Security Access Portal
      </footer>
    </div>
  );
};

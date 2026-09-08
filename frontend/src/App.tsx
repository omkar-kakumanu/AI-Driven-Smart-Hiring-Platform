import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardView } from './pages/DashboardView';
import { ResumeUploadView } from './pages/ResumeUploadView';
import { SettingsView } from './pages/SettingsView';
import { MatchingView } from './pages/MatchingView';
import { useRecruitmentStore } from './store/useRecruitmentStore';
import type { UserProfile } from './types';


export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('rc_is_authenticated') === 'true';
  });
  const [inApp, setInApp] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobDepartment, setJobDepartment] = useState('');
  const [jobSkills, setJobSkills] = useState('');

  // Central Reactive Recruitment Store
  const store = useRecruitmentStore();

  // Filter candidates based on Header Search Query
  const filteredCandidates = store.candidates.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.currentRole.toLowerCase().includes(q) ||
      (c.degree || '').toLowerCase().includes(q) ||
      (c.skills || []).some(s => s.toLowerCase().includes(q))
    );
  });

  const handleLogin = (profile: UserProfile & { userType: 'ADMIN' | 'USER'; status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVOKED' }) => {
    store.updateUserProfile({
      name: profile.name,
      role: profile.role,
      email: profile.email,
      userType: profile.userType,
      status: profile.status
    });
    setIsAuthenticated(true);
    localStorage.setItem('rc_is_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('rc_is_authenticated', 'false');
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        userAccounts={store.userAccounts} 
        onLogin={handleLogin} 
        onRegister={store.registerUser} 
      />
    );
  }

  if (!inApp) {
    return <LandingPage onEnterApp={() => setInApp(true)} />;
  }

  const handleCreateJob = () => {
    if (!jobTitle.trim()) return alert("Please enter job title.");
    store.addJob({
      title: jobTitle,
      department: jobDepartment || 'Engineering',
      location: 'San Francisco, CA (Hybrid)',
      employmentType: 'Full-time',
      minSalary: 140000,
      maxSalary: 190000,
      description: 'Role responsible for core backend and system architecture.',
      requiredSkills: jobSkills ? jobSkills.split(',').map((s: string) => s.trim()) : ['Python', 'Java', 'React'],
      preferredSkills: ['Docker', 'AWS'],
      minExperienceYears: 3,
      educationRequirement: 'BS in Computer Science',
      status: 'ACTIVE'
    });

    setShowNewJobModal(false);
    setJobTitle('');
    setJobDepartment('');
    setJobSkills('');
    alert("New Job Requirement Profile Created Successfully!");
  };

  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'AI Recruitment Copilot', subtitle: 'Automate candidate screening and improve hiring efficiency with AI' };
      case 'resume-upload':
        return { title: 'Resume Parsing & Candidate Profiling', subtitle: 'Upload and process resumes to create structured candidate profiles' };
      case 'candidates':
        return { title: 'Candidate Directory & Profiling', subtitle: 'Candidate technical profiles and skill inventory' };
      case 'matching':
        return { title: 'Matching & Skill Analysis', subtitle: 'Candidate-job matching and skill-gap analysis' };
      case 'settings':
        return { title: 'System Settings', subtitle: 'Configure user access approvals and database settings' };
      default:
        return { title: 'Recruitment Copilot', subtitle: 'AI Hiring Intelligence Platform' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        userProfile={store.userProfile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          userProfile={store.userProfile}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewJobClick={() => setShowNewJobModal(true)}
          onProfileClick={() => setCurrentTab('settings')}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView 
              onNavigate={setCurrentTab} 
              candidates={filteredCandidates}
              jobs={store.jobs}
            />
          )}
          {currentTab === 'resume-upload' && (
            <ResumeUploadView 
              candidates={filteredCandidates}
              onAddCandidate={store.addCandidate}
              onNavigateToMatching={() => setCurrentTab('matching')}
            />
          )}
          {currentTab === 'candidates' && (
            <ResumeUploadView 
              candidates={filteredCandidates}
              onAddCandidate={store.addCandidate}
              onNavigateToMatching={() => setCurrentTab('matching')}
            />
          )}
          {currentTab === 'matching' && (
            <MatchingView 
              candidates={filteredCandidates}
              jobs={store.jobs}
            />
          )}
          {currentTab === 'settings' && (
            <SettingsView 
              atsProviders={store.atsProviders} 
              userProfile={store.userProfile}
              onUpdateUserProfile={store.updateUserProfile}
              userAccounts={store.userAccounts}
              onApproveUser={store.approveUser}
              onRejectUser={store.rejectUser}
              onRevokeUserAccess={store.revokeUserAccess}
              onDeleteUserAccount={store.deleteUserAccount}
              onMakeUserAdmin={store.makeUserAdmin}
              onClearAllCandidates={store.clearAllCandidates}
              onClearAllUserAccounts={store.clearAllUserAccounts}
            />
          )}
        </main>
      </div>

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Create New Job Requirement Profile</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                <input 
                  type="text" 
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Machine Learning Engineer" 
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <input 
                  type="text" 
                  value={jobDepartment}
                  onChange={e => setJobDepartment(e.target.value)}
                  placeholder="e.g. AI & Data Science" 
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Technical Skills (comma separated)</label>
                <input 
                  type="text" 
                  value={jobSkills}
                  onChange={e => setJobSkills(e.target.value)}
                  placeholder="Python, TensorFlow, MLOps, AWS, Docker" 
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowNewJobModal(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateJob} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20">Create Job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

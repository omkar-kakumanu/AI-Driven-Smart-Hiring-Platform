import React, { useState, useEffect } from 'react';
import type { ATSProvider, UserProfile, UserAccount } from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface SettingsViewProps {
  atsProviders?: ATSProvider[];
  userProfile?: UserProfile;
  onUpdateUserProfile?: (updates: Partial<UserProfile>) => void;
  userAccounts?: UserAccount[];
  onApproveUser?: (userId: string) => void;
  onRejectUser?: (userId: string) => void;
  onRevokeUserAccess?: (userId: string) => void;
  onDeleteUserAccount?: (userId: string) => void;
  onMakeUserAdmin?: (userId: string) => void;
  onClearAllCandidates?: () => void;
  onClearAllUserAccounts?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  atsProviders = [],
  userProfile,
  onUpdateUserProfile,
  userAccounts = [],
  onApproveUser,
  onRejectUser,
  onRevokeUserAccess,
  onDeleteUserAccount,
  onMakeUserAdmin,
  onClearAllCandidates,
  onClearAllUserAccounts
}) => {
  // User Profile Form State
  const [name, setName] = useState(userProfile?.name || 'Sarah Jenkins');
  const [role, setRole] = useState(userProfile?.role || 'Lead Recruiter');
  const [email, setEmail] = useState(userProfile?.email || 'recruiter@copilot.com');
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

  const handleSaveProfile = () => {
    if (onUpdateUserProfile) {
      onUpdateUserProfile({ name, role, email, avatar });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setAvatar(undefined);
  };

  const activeProviders = atsProviders.length > 0 ? atsProviders : [
    { id: 'greenhouse', name: 'Greenhouse ATS', logo: 'GH', status: 'Connected' as const, lastSync: '10 mins ago', candidateCount: 142 },
    { id: 'lever', name: 'Lever Recruiter', logo: 'LV', status: 'Disconnected' as const, lastSync: 'Never', candidateCount: 0 },
    { id: 'workday', name: 'Workday Human Capital', logo: 'WD', status: 'Connected' as const, lastSync: '1 hour ago', candidateCount: 89 },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings & Administration</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage user access approvals, profile details, AI LLM endpoints, and integrations</p>
      </div>

      {/* User Profile Settings Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="font-bold text-slate-900 text-base">
            User Profile Settings
          </div>
          {savedSuccess && (
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Profile Updated Successfully!
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Photo Upload Box */}
          <div className="flex flex-col items-center gap-3 space-y-1">
            <label className="text-xs font-bold text-slate-700">Profile Photo</label>
            <div className="relative group">
              <UserAvatar name={name} avatar={avatar} size="xl" className="border-4 border-indigo-100 shadow-md" />
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
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-indigo-200"
              >
                Upload Photo
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200"
                  title="Clear photo to use initials badge"
                >
                  Clear
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
                  placeholder="e.g. Lead Recruiter"
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Save User Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Administrator User Approvals Console */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">User Accounts & Administrator Approval Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage user access rights. Only logged-in Administrators can grant, promote, or revoke user access.</p>
          </div>
          <div className="flex items-center gap-2">
            {userProfile?.userType === 'ADMIN' && (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear the User Accounts approval queue? This will reset user accounts to default Main Super Admin.")) {
                    onClearAllUserAccounts && onClearAllUserAccounts();
                    alert("User Accounts approval queue cleared successfully!");
                  }
                }}
                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-colors"
                title="Clear all secondary/pending user accounts"
              >
                Clear User Accounts Queue
              </button>
            )}
            <span className="px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-bold">
              {userAccounts.filter(u => u.status === 'PENDING').length} Pending Requests
            </span>
          </div>
        </div>

        {userProfile?.userType !== 'ADMIN' ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
            <span className="font-bold text-slate-900 text-xs block">Administrator Privileges Required</span>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You are currently logged in as a Standard Recruiter. Access control management and user approvals are restricted exclusively to system Administrators.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 font-bold text-slate-500 bg-slate-50">
                  <th className="py-2.5 px-3">User Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Access Control Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {userAccounts.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {user.name}
                      {user.isSuperAdmin && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-black rounded border border-blue-200">
                          Main Super-Admin
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{user.email}</td>
                    <td className="py-3 px-3 text-slate-600">{user.role}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.userType === 'ADMIN' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.userType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'APPROVED' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : user.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {user.isSuperAdmin ? (
                        <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                          Protected Main Admin
                        </span>
                      ) : (
                        <>
                          {user.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => onApproveUser && onApproveUser(user.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px]"
                              >
                                Approve Access
                              </button>
                              <button
                                onClick={() => onRejectUser && onRejectUser(user.id)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {user.status === 'APPROVED' && (
                            <>
                              {user.userType !== 'ADMIN' && (
                                <button
                                  onClick={() => onMakeUserAdmin && onMakeUserAdmin(user.id)}
                                  className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded text-[10px] hover:bg-blue-100"
                                  title="Promote to Administrator"
                                >
                                  + Make Admin
                                </button>
                              )}
                              <button
                                onClick={() => onRevokeUserAccess && onRevokeUserAccess(user.id)}
                                className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded text-[10px] hover:bg-rose-100"
                                title="Revoke user access at any time"
                              >
                                Revoke Access
                              </button>
                            </>
                          )}

                          {(user.status === 'REJECTED' || user.status === 'REVOKED') && (
                            <button
                              onClick={() => onApproveUser && onApproveUser(user.id)}
                              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded text-[10px]"
                            >
                              Re-Approve Access
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently delete account for "${user.name}" (${user.email})?`)) {
                                onDeleteUserAccount && onDeleteUserAccount(user.id);
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white border border-slate-300 text-slate-700 font-bold rounded text-[10px] transition-colors"
                            title="Permanently delete user account from system"
                          >
                            Delete Account
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Candidate Resume Data Reset Management */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Candidate Resume Database Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">Clear all stored candidate resume data to reset the system for fresh uploads.</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all candidate resume data?")) {
                onClearAllCandidates && onClearAllCandidates();
                alert("Candidate resume database cleared successfully!");
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Clear All Candidate Resumes
          </button>
        </div>
      </div>

      {/* ATS Integrations */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="font-bold text-slate-900 text-base">
          ATS Provider Integrations
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeProviders.map((provider) => (
            <div key={provider.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs bg-slate-200 text-slate-800 px-2 py-1 rounded">{provider.logo}</span>
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

import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  // Compute initials from full name (e.g., "Sarah Jenkins" -> "SJ")
  const getInitials = (fullName: string): string => {
    if (!fullName || !fullName.trim()) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Size styling map
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (avatar && !imageError) {
    return (
      <img
        src={avatar}
        alt={name || 'User Profile'}
        onError={() => setImageError(true)}
        className={`${currentSizeClass} rounded-full object-cover border border-slate-200 shadow-sm ${className}`}
      />
    );
  }

  // Initial avatar badge fallback when no photo is provided
  return (
    <div
      className={`${currentSizeClass} rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-bold flex items-center justify-center shadow-sm shrink-0 ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

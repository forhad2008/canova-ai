import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  HelpCircle,
  Sparkles,
  ChevronRight,
  LogOut,
  Camera,
  Check,
  Edit3,
} from 'lucide-react';
import { UserProfile, ScreenType } from '../types';
import { soundFx } from '../utils/audio';
import photoAvatar from '../assets/photo.png';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenProModal: () => void;
  onLogOut: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  onUpdateUser,
  onNavigate,
  onOpenProModal,
  onLogOut,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [headline, setHeadline] = useState(user.headline);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playSuccess();
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateUser({ avatar: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    onUpdateUser({ name, headline });
    setIsEditing(false);
  };

  return (
    <div className="relative flex flex-col space-y-5 px-5 py-4 pb-28 text-center select-none max-w-2xl mx-auto w-full">
      {/* Hidden file input for uploading real photo.png */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* 1. Avatar & Atmospheric Glow */}
      <div className="relative pt-3 flex flex-col items-center">
        {/* Soft purple radial halo */}
        <div className="absolute top-2 w-44 h-44 bg-purple-600/30 rounded-full blur-[65px] pointer-events-none" />

        {/* Circular Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#7C4DFF] via-[#3B72FF] to-[#0284C7] dark:from-[#8B5CFF] dark:via-[#4C7DFF] dark:to-[#35C9FF] shadow-[0_4px_20px_rgba(124,77,255,0.4)] dark:shadow-[0_0_25px_rgba(139,92,255,0.55)]">
            <img
              src={user.avatar || photoAvatar}
              alt={user.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = photoAvatar;
              }}
              className="w-full h-full object-cover rounded-full border-2 border-white dark:border-[#0B1730]"
            />
          </div>

          {/* Edit / Upload avatar button */}
          <button
            onClick={() => {
              soundFx.playClick();
              fileInputRef.current?.click();
            }}
            aria-label="Upload photo"
            title="Upload your real photo"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full neu-primary-btn text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform"
          >
            <Camera size={14} />
          </button>
        </div>

        {/* User Identity */}
        <div className="mt-4 space-y-1">
          <h2 className="text-xl font-extrabold text-black dark:text-white tracking-tight">
            {user.name}
          </h2>
          <p className="text-xs text-purple-700 dark:text-[#9AA8C7] font-bold">{user.username}</p>
          <p className="text-xs text-slate-800 dark:text-[#657394] font-medium max-w-xs mx-auto pt-1 leading-snug">
            {user.headline}
          </p>
        </div>
      </div>

      {/* Edit Profile inline drawer */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="neu-card rounded-2xl p-4 text-left space-y-3">
          <h4 className="text-xs font-bold text-black dark:text-white">Edit Profile</h4>
          <div>
            <label className="text-[11px] font-bold text-slate-900 dark:text-[#9AA8C7] block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full neu-inset rounded-xl py-2 px-3 text-xs text-black dark:text-white font-medium"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-900 dark:text-[#9AA8C7] block mb-1">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full neu-inset rounded-xl py-2 px-3 text-xs text-black dark:text-white font-medium"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsEditing(false);
              }}
              className="px-3 py-1.5 neu-button text-xs text-slate-800 dark:text-[#9AA8C7] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 neu-primary-btn text-xs text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <Check size={12} /> Save
            </button>
          </div>
        </form>
      )}

      {/* 2. Stats Row: Projects, Followers, Following */}
      <div className="neu-card rounded-2xl py-3 px-4 flex items-center justify-around border border-black/5 dark:border-white/8 shadow-md">
        <div className="text-center">
          <span className="text-lg font-black text-black dark:text-white block">
            {user.projectsCount}
          </span>
          <span className="text-[11px] font-medium text-slate-800 dark:text-[#657394]">Projects</span>
        </div>
        <div className="w-[1px] h-8 bg-black/10 dark:bg-white/10" />
        <div className="text-center">
          <span className="text-lg font-black text-black dark:text-white block">
            {user.followersCount}
          </span>
          <span className="text-[11px] font-medium text-slate-800 dark:text-[#657394]">Followers</span>
        </div>
        <div className="w-[1px] h-8 bg-black/10 dark:bg-white/10" />
        <div className="text-center">
          <span className="text-lg font-black text-black dark:text-white block">
            {user.followingCount}
          </span>
          <span className="text-[11px] font-medium text-slate-800 dark:text-[#657394]">Following</span>
        </div>
      </div>

      {/* 3. Action Navigation List */}
      <div className="neu-card rounded-2xl overflow-hidden divide-y divide-black/5 dark:divide-white/5 border border-black/5 dark:border-white/8 text-left">
        {/* My Profile */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsEditing(true);
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-700 dark:text-[#A978FF] flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="text-xs font-bold text-black dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
              My Profile
            </span>
          </div>
          <ChevronRight size={16} className="text-slate-600 dark:text-[#657394]" />
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('settings');
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-700 dark:text-[#35C9FF] flex items-center justify-center">
              <SettingsIcon size={16} />
            </div>
            <span className="text-xs font-bold text-black dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
              Settings
            </span>
          </div>
          <ChevronRight size={16} className="text-slate-600 dark:text-[#657394]" />
        </button>

        {/* Help & Support */}
        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('assistant');
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-[#35C9FF] flex items-center justify-center">
              <HelpCircle size={16} />
            </div>
            <span className="text-xs font-bold text-black dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
              Help & Support
            </span>
          </div>
          <ChevronRight size={16} className="text-slate-600 dark:text-[#657394]" />
        </button>

        {/* Upgrade to Pro */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenProModal();
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500/30 to-pink-500/30 text-purple-700 dark:text-[#D66BFF] flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <span className="text-xs font-bold text-black dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
              Upgrade to Pro
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm">
              Pro
            </span>
            <ChevronRight size={16} className="text-slate-600 dark:text-[#657394]" />
          </div>
        </button>
      </div>

      {/* 4. Log Out Neumorphic Capsule Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          onLogOut();
        }}
        className="w-full py-3.5 rounded-full neu-button bg-gradient-to-r from-red-950/30 via-[#180e28] to-[#12081d] border border-red-500/20 text-xs font-semibold text-red-400 hover:text-red-300 hover:border-red-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
      >
        <LogOut size={16} />
        <span>Log Out</span>
      </button>
    </div>
  );
};

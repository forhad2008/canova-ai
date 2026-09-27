/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenType, Task, FileItem, AITool, UserProfile } from './types';

// Components
import { BottomNav } from './components/navigation/BottomNav';
import { HomeIndicator } from './components/navigation/HomeIndicator';
import { Sidebar } from './components/navigation/Sidebar';
import { DesktopWorkspace } from './components/desktop/DesktopWorkspace';

// Pages (for Mobile)
import { Splash } from './pages/Splash';
import { Home } from './pages/Home';
import { Assistant } from './pages/Assistant';
import { Tasks } from './pages/Tasks';
import { Analytics } from './pages/Analytics';
import { Explore } from './pages/Explore';
import { Files } from './pages/Files';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

// Modals
import { ToolModal } from './components/modals/ToolModal';
import { ProModal } from './components/modals/ProModal';
import { InstallAppModal } from './components/modals/InstallAppModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';

import { startAlarmService } from './utils/alarmService';
import { checkAndExecute24hReset } from './utils/autoResetService';

import photoAvatar from './assets/photo.png';

const DEFAULT_USER: UserProfile = {
  name: 'Abdullah Forhad',
  username: '@forhad2008',
  headline: 'Graphics Designer | Web Developer | Student',
  avatar: photoAvatar,
  projectsCount: 28,
  followersCount: '2.2k',
  followingCount: '3.5k',
  plan: 'Free',
};

const DEFAULT_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Finish website design',
    category: 'Design',
    duration: '2 hours',
    completed: true,
    dueDate: 'today',
    priority: 'high',
  },
  {
    id: 't2',
    title: 'Edit video project',
    category: 'Creative',
    duration: '1 hour',
    completed: false,
    dueDate: 'today',
    priority: 'medium',
  },
  {
    id: 't3',
    title: 'Study Python',
    category: 'Learning',
    duration: '2 hours',
    completed: false,
    dueDate: 'today',
    priority: 'high',
  },
  {
    id: 't4',
    title: 'Workout',
    category: 'Health',
    duration: '1 hour',
    completed: false,
    dueDate: 'week',
    priority: 'medium',
  },
  {
    id: 't5',
    title: 'Read a book',
    category: 'Personal',
    duration: '30 min',
    completed: false,
    dueDate: 'week',
    priority: 'low',
  },
];

const DEFAULT_FILES: FileItem[] = [
  {
    id: 'f1',
    name: 'Project Proposal.pdf',
    size: '2.4 MB',
    date: '2 days ago',
    category: 'documents',
    extension: 'pdf',
    color: '#ef4444',
  },
  {
    id: 'f2',
    name: 'Design_Mockup.fig',
    size: '5.8 MB',
    date: '3 days ago',
    category: 'documents',
    extension: 'fig',
    color: '#3b82f6',
  },
  {
    id: 'f3',
    name: 'Notes.txt',
    size: '120 KB',
    date: '4 days ago',
    category: 'documents',
    extension: 'txt',
    color: '#06b6d4',
  },
  {
    id: 'f4',
    name: 'Website_Build.zip',
    size: '12.6 MB',
    date: '5 days ago',
    category: 'others',
    extension: 'zip',
    color: '#f59e0b',
  },
  {
    id: 'f5',
    name: 'Photo_Collection.zip',
    size: '48.2 MB',
    date: '6 days ago',
    category: 'others',
    extension: 'zip',
    color: '#ea580c',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [activeTool, setActiveTool] = useState<AITool | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installModalTab, setInstallModalTab] = useState<'desktop' | 'android'>('desktop');
  const [assistantPrompt, setAssistantPrompt] = useState<string | undefined>(undefined);

  const handleOpenInstallModal = (tab: 'desktop' | 'android' = 'desktop') => {
    setInstallModalTab(tab);
    setIsInstallModalOpen(true);
  };

  // Local storage state with initial fallbacks
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('nova_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        let updated = { ...parsed };
        if (!updated.avatar || updated.avatar.includes('images.unsplash.com')) {
          updated.avatar = photoAvatar;
        }
        if (updated.followersCount === '12k' || !updated.followersCount) {
          updated.followersCount = '2.2k';
        }
        return updated;
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('nova_tasks');
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [files, setFiles] = useState<FileItem[]>(() => {
    try {
      const saved = localStorage.getItem('nova_files');
      return saved ? JSON.parse(saved) : DEFAULT_FILES;
    } catch {
      return DEFAULT_FILES;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('nova_user', JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('nova_tasks', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('nova_files', JSON.stringify(files));
    } catch {}
  }, [files]);

  // Start Task Alarm & Daily Goal Check-in background runner
  useEffect(() => {
    startAlarmService(
      () => tasks,
      (taskId) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, alarmFired: true } : t))
        );
      }
    );
  }, [tasks]);

  // 24-Hour Auto-Reset Tasks Runner (Runs on mount and interval)
  useEffect(() => {
    // Immediate check on app load
    checkAndExecute24hReset(tasks, (newTasks) => {
      setTasks(newTasks);
    });

    // Check every 10 seconds for 24h reset cycle expiry
    const intervalId = setInterval(() => {
      checkAndExecute24hReset(tasks, (newTasks) => {
        setTasks(newTasks);
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [tasks]);

  // Task actions
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    setTasks((prev) => [{ ...newTask, id: `t-${Date.now()}` }, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTaskPriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority } : t))
    );
  };

  const handleUpdateTaskDate = (id: string, newDateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetDateObj = new Date(newDateStr + 'T00:00:00');
    const todayDateObj = new Date(todayStr + 'T00:00:00');
    const diffDays = Math.round((targetDateObj.getTime() - todayDateObj.getTime()) / (1000 * 3600 * 24));

    let dueDate: 'today' | 'week' | 'all' = 'all';
    if (newDateStr === todayStr) {
      dueDate = 'today';
    } else if (diffDays >= 0 && diffDays <= 7) {
      dueDate = 'week';
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              scheduledDate: newDateStr,
              dueDate,
              isOverdue: false,
            }
          : t
      )
    );
  };

  // File actions
  const handleAddFile = (newFile: Omit<FileItem, 'id'>) => {
    setFiles((prev) => [{ ...newFile, id: `f-${Date.now()}` }, ...prev]);
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleQuickPrompt = (prompt: string) => {
    setAssistantPrompt(prompt);
    setCurrentScreen('assistant');
  };

  const handleClearAllData = () => {
    localStorage.removeItem('nova_user');
    localStorage.removeItem('nova_tasks');
    localStorage.removeItem('nova_files');
    setUser(DEFAULT_USER);
    setTasks(DEFAULT_TASKS);
    setFiles(DEFAULT_FILES);
  };

  const handleUpgradeToPro = () => {
    setUser((prev) => ({ ...prev, plan: 'Pro' }));
    setIsProModalOpen(false);
  };

  // Render Mobile View
  const renderMobileContent = () => {
    switch (currentScreen) {
      case 'splash':
        return <Splash onStart={() => setCurrentScreen('home')} />;
      case 'home':
        return (
          <Home
            user={user}
            tasks={tasks}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onQuickPrompt={handleQuickPrompt}
            onOpenInstallModal={handleOpenInstallModal}
          />
        );
      case 'assistant':
        return (
          <Assistant
            onBack={() => setCurrentScreen('home')}
            initialPrompt={assistantPrompt}
            tasks={tasks}
            onToggleTask={handleToggleTask}
          />
        );
      case 'tasks':
        return (
          <Tasks
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskPriority={handleUpdateTaskPriority}
            onUpdateTaskDate={handleUpdateTaskDate}
          />
        );
      case 'analytics':
        return <Analytics onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'explore':
        return <Explore onSelectTool={(tool) => setActiveTool(tool)} />;
      case 'files':
        return (
          <Files
            files={files}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
          />
        );
      case 'profile':
        return (
          <Profile
            user={user}
            onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenProModal={() => setIsProModalOpen(true)}
            onOpenInstallModal={handleOpenInstallModal}
            onLogOut={() => setCurrentScreen('splash')}
          />
        );
      case 'settings':
        return (
          <Settings
            onBack={() => setCurrentScreen('profile')}
            onClearData={handleClearAllData}
            onOpenInstallModal={handleOpenInstallModal}
          />
        );
      default:
        return (
          <Home
            user={user}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onQuickPrompt={handleQuickPrompt}
            onOpenInstallModal={handleOpenInstallModal}
          />
        );
    }
  };

  return (
    <div className="w-screen h-screen bg-[#EEF2F9] dark:bg-[#030712] text-[#1E293B] dark:text-[#F7F8FF] overflow-hidden flex flex-col relative transition-colors duration-200">
      {/* 
        ========================================================================
        AMBIENT LIQUID MESH CANVAS (Refracted through all Glassmorphism surfaces)
        ========================================================================
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Top-left Liquid Purple/Indigo Orb */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-indigo-500/35 via-purple-500/25 to-pink-500/15 blur-3xl animate-liquid-blob-1 dark:from-indigo-600/30 dark:via-purple-600/20" />
        
        {/* Top-right Liquid Cyan & Sky Orb */}
        <div className="absolute -top-20 -right-28 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-cyan-400/35 via-sky-500/25 to-blue-600/15 blur-3xl animate-liquid-blob-2 dark:from-cyan-500/25 dark:via-blue-600/18" />
        
        {/* Center Floating Violet Prism Orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-fuchsia-500/20 via-violet-600/25 to-indigo-400/15 blur-3xl animate-liquid-blob-3 dark:from-fuchsia-600/18 dark:via-purple-800/20" />

        {/* Bottom-left Liquid Emerald & Cyan Caustic Orb */}
        <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-400/25 via-teal-500/20 to-cyan-600/15 blur-3xl animate-liquid-blob-1 dark:from-emerald-600/18 dark:via-teal-700/15" />

        {/* Bottom-right Warm Rose/Amber Accent Orb */}
        <div className="absolute -bottom-28 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-rose-500/20 via-pink-500/18 to-amber-400/12 blur-3xl animate-liquid-blob-2 dark:from-rose-600/15 dark:via-purple-900/15" />
      </div>

      {/* 
        ========================================================================
        DESKTOP SUITE (Real, full-screen edge-to-edge professional workstation)
        Visible on tablet and desktop screens (>= md)
        NO mobile phone frame, NO mockup bezel, NO mobile switcher on desktop
        ========================================================================
      */}
      <div className="hidden md:flex w-full h-full overflow-hidden relative z-10">
        {/* Left Desktop Sidebar */}
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onOpenProModal={() => setIsProModalOpen(true)}
          onOpenInstallModal={handleOpenInstallModal}
          pendingTasksCount={tasks.filter((t) => !t.completed).length}
        />

        {/* Right Main Full-Width Desktop Workspace */}
        <div className="flex-1 h-full overflow-hidden flex flex-col">
          <DesktopWorkspace
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            user={user}
            tasks={tasks}
            files={files}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskPriority={handleUpdateTaskPriority}
            onUpdateTaskDate={handleUpdateTaskDate}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onSelectTool={(tool) => setActiveTool(tool)}
            onOpenProModal={() => setIsProModalOpen(true)}
            onOpenInstallModal={handleOpenInstallModal}
            onQuickPrompt={handleQuickPrompt}
            onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            onClearData={handleClearAllData}
          />
        </div>
      </div>

      {/* 
        ========================================================================
        MOBILE VIEW (Native touch experience, kept strictly for mobile screens)
        Visible only on mobile screens (< md)
        Full-screen responsive native mobile experience
        ========================================================================
      */}
      <div className="flex md:hidden w-full h-full flex-col overflow-hidden bg-[#EEF2F9]/70 dark:bg-[#030712]/70 relative z-10 transition-colors duration-200 backdrop-blur-3xl">
        {/* Mobile Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar">
          {renderMobileContent()}
        </div>

        {/* Native Mobile Bottom Navigation with center floating AI button */}
        {currentScreen !== 'splash' && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}

        {/* iPhone Home Bar */}
        <HomeIndicator />
      </div>

      {/* Shared Interactive Modals */}
      <ToolModal
        tool={activeTool}
        onClose={() => setActiveTool(null)}
        onAddNoteToFile={handleAddFile}
      />

      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onUpgrade={handleUpgradeToPro}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        defaultTab={installModalTab}
      />

      <OfflineIndicator />
    </div>
  );
}

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

import photoAvatar from './assets/photo.png';

const DEFAULT_USER: UserProfile = {
  name: 'Abdullah Forhad',
  username: '@forhad2008',
  headline: 'Graphics Designer | Web Developer | Student',
  avatar: photoAvatar,
  projectsCount: 28,
  followersCount: '12k',
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
        if (!parsed.avatar || parsed.avatar.includes('images.unsplash.com')) {
          return { ...parsed, avatar: photoAvatar };
        }
        return parsed;
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
    <div className="w-screen h-screen bg-[#EEF2F9] dark:bg-[#030712] text-[#1E293B] dark:text-[#F7F8FF] overflow-hidden flex flex-col transition-colors duration-200">
      {/* 
        ========================================================================
        DESKTOP SUITE (Real, full-screen edge-to-edge professional workstation)
        Visible on tablet and desktop screens (>= md)
        NO mobile phone frame, NO mockup bezel, NO mobile switcher on desktop
        ========================================================================
      */}
      <div className="hidden md:flex w-full h-full overflow-hidden">
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
      <div className="flex md:hidden w-full h-full flex-col overflow-hidden bg-[#EEF2F9] dark:bg-[#030712] relative transition-colors duration-200">
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

export type ScreenType =
  | 'splash'
  | 'home'
  | 'assistant'
  | 'tasks'
  | 'analytics'
  | 'explore'
  | 'files'
  | 'profile'
  | 'settings';

export interface Task {
  id: string;
  title: string;
  category: string;
  duration: string;
  completed: boolean;
  dueDate: 'today' | 'week' | 'all';
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
  category: 'documents' | 'images' | 'others';
  extension: string;
  color: string;
}

export interface AITool {
  id: string;
  title: string;
  description: string;
  category: 'Productivity' | 'Design' | 'Development' | 'Search';
  accentColor: string;
  badge?: string;
}

export interface StructuredCard {
  kicker?: string;
  title: string;
  description: string;
  tags?: string[];
  followUp?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structuredCard?: StructuredCard;
  suggestionChips?: string[];
}

export interface UserProfile {
  name: string;
  username: string;
  headline: string;
  avatar: string;
  projectsCount: number;
  followersCount: string;
  followingCount: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
}

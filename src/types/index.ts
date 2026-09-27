export type ScreenType =
  | 'splash'
  | 'home'
  | 'assistant'
  | 'tasks'
  | 'study'
  | 'worktools'
  | 'analytics'
  | 'explore'
  | 'files'
  | 'profile'
  | 'settings';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  category: string;
  duration: string;
  completed: boolean;
  dueDate: 'today' | 'week' | 'all';
  priority?: TaskPriority;
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  alarmTime?: string;     // HH:mm
  alarmEnabled?: boolean;
  alarmFired?: boolean;
  isOverdue?: boolean;
  reminderTime?: string;
  hasReminder?: boolean;
  routineTimerEnabled?: boolean;
  routineTime?: string;         // HH:mm routine reminder time
  routineDurationMins?: number; // duration in minutes (e.g. 15, 25, 30, 45, 60)
  routineDays?: string[];       // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  createdAt?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'note' | 'flashcard' | 'quiz' | 'summary';
  content: string;
  subject?: string;
  tags?: string[];
  createdAt: string;
  flashcards?: { question: string; answer: string }[];
  quizQuestions?: { question: string; options: string[]; answerIndex: number }[];
}

export interface WorkToolItem {
  id: string;
  toolType: 'summary' | 'notes' | 'pomodoro' | 'code' | 'spreadsheet';
  title: string;
  content: string;
  updatedAt: string;
}

export interface TaskReminder {
  id: string;
  title: string;
  targetId: string;
  reminderTime: string;
  status: 'pending' | 'triggered' | 'dismissed';
  createdAt: string;
}

export interface ExtractedZipEntry {
  name: string;
  size: number;
  sizeFormatted: string;
  isFolder: boolean;
  date?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  bytes?: number;
  date: string;
  category: 'documents' | 'images' | 'others';
  extension: string;
  color: string;
  dataUrl?: string;
  fileBlob?: Blob;
  isZip?: boolean;
  zipContents?: ExtractedZipEntry[];
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

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  mimeType: string;
  size: string;
  dataUrl: string; // Base64 data url or preview
  textContent?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structuredCard?: StructuredCard;
  suggestionChips?: string[];
  attachments?: ChatAttachment[];
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
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

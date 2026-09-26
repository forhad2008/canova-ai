import { Task, FileItem, ChatMessage, ScreenType } from '../../types';

export type SearchResultType = 'task' | 'file' | 'conversation' | 'action';

export interface GlobalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  snippet?: string;
  badge?: string;
  badgeColor?: string;
  targetScreen: ScreenType;
  actionPayload?: {
    taskId?: string;
    fileId?: string;
    prompt?: string;
  };
}

export interface SearchIndexGroup {
  category: 'Tasks' | 'Files' | 'AI Conversations' | 'Quick AI Actions';
  type: SearchResultType;
  items: GlobalSearchResult[];
}

/**
 * High-performance mock search indexer that indexes across user tasks, files,
 * and AI conversations with relevance ranking and highlighted snippets.
 */
export function queryGlobalSearchIndex(
  query: string,
  tasks: Task[],
  files: FileItem[],
  conversations: ChatMessage[]
): SearchIndexGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchIndexGroup[] = [];

  // 1. Index Tasks
  const matchedTasks: GlobalSearchResult[] = tasks
    .filter((task) => {
      return (
        task.title.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q) ||
        (task.dueDate && task.dueDate.toLowerCase().includes(q))
      );
    })
    .slice(0, 4)
    .map((task) => ({
      id: `task-${task.id}`,
      type: 'task',
      title: task.title,
      subtitle: `${task.category} • ${task.duration} • ${task.completed ? 'Completed' : 'Pending'}`,
      badge: task.completed ? 'Done' : task.dueDate || 'Today',
      badgeColor: task.completed
        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20',
      targetScreen: 'tasks',
      actionPayload: { taskId: task.id },
    }));

  if (matchedTasks.length > 0) {
    results.push({
      category: 'Tasks',
      type: 'task',
      items: matchedTasks,
    });
  }

  // 2. Index Files & Workspace Notes
  const matchedFiles: GlobalSearchResult[] = files
    .filter((file) => {
      return (
        file.name.toLowerCase().includes(q) ||
        (file.extension && file.extension.toLowerCase().includes(q)) ||
        (file.category && file.category.toLowerCase().includes(q))
      );
    })
    .slice(0, 4)
    .map((file) => {
      return {
        id: `file-${file.id}`,
        type: 'file',
        title: file.name,
        subtitle: `${file.size || '12 KB'} • Added ${file.date || 'Recently'}`,
        badge: (file.extension || 'file').toUpperCase(),
        badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
        targetScreen: 'files',
        actionPayload: { fileId: file.id },
      };
    });

  if (matchedFiles.length > 0) {
    results.push({
      category: 'Files',
      type: 'file',
      items: matchedFiles,
    });
  }

  // 3. Index Assistant Conversations
  const matchedConvos: GlobalSearchResult[] = conversations
    .filter((msg) => {
      const textMatches = msg.text.toLowerCase().includes(q);
      const cardTitleMatches = msg.structuredCard?.title.toLowerCase().includes(q);
      const cardDescMatches = msg.structuredCard?.description.toLowerCase().includes(q);
      const chipsMatch = msg.suggestionChips?.some((chip) => chip.toLowerCase().includes(q));
      return textMatches || cardTitleMatches || cardDescMatches || chipsMatch;
    })
    .slice(0, 3)
    .map((msg) => {
      const rawText = msg.structuredCard ? `${msg.structuredCard.title}: ${msg.structuredCard.description}` : msg.text;
      const lower = rawText.toLowerCase();
      const idx = lower.indexOf(q);
      let snippet = rawText;
      if (idx !== -1) {
        const start = Math.max(0, idx - 15);
        const end = Math.min(rawText.length, idx + q.length + 45);
        snippet = `${start > 0 ? '...' : ''}${rawText.slice(start, end)}${end < rawText.length ? '...' : ''}`;
      } else {
        snippet = rawText.slice(0, 60) + '...';
      }

      return {
        id: `msg-${msg.id}`,
        type: 'conversation',
        title: msg.structuredCard?.title || (msg.sender === 'user' ? 'Your Query' : 'Canova AI Synthesis'),
        subtitle: `${msg.timestamp} • ${msg.sender === 'user' ? 'User Prompt' : 'AI Assistant Response'}`,
        snippet,
        badge: msg.sender === 'user' ? 'Prompt' : 'Response',
        badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
        targetScreen: 'assistant',
        actionPayload: { prompt: msg.text },
      };
    });

  if (matchedConvos.length > 0) {
    results.push({
      category: 'AI Conversations',
      type: 'conversation',
      items: matchedConvos,
    });
  }

  // 4. Quick AI Actions (Always offer to synthesize or ask Canova AI about this query)
  const quickActions: GlobalSearchResult[] = [
    {
      id: `ai-ask-${q}`,
      type: 'action',
      title: `Ask Canova AI: "${query}"`,
      subtitle: 'Stream intelligent analysis, code generation, or task breakdown',
      badge: 'AI Prompt',
      badgeColor: 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-700 dark:text-purple-300 border-purple-400/30',
      targetScreen: 'assistant',
      actionPayload: { prompt: query },
    },
  ];

  results.push({
    category: 'Quick AI Actions',
    type: 'action',
    items: quickActions,
  });

  return results;
}

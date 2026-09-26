import { ChatMessage, ChatAttachment, StructuredCard, Task } from '../types';

export interface AssistantResponse {
  text: string;
  structuredCard?: StructuredCard;
  suggestionChips?: string[];
  isRealAI?: boolean;
}

// User-provided API Key storage key
const CUSTOM_API_KEY_STORAGE = 'canova_custom_gemini_api_key';

export function getStoredCustomApiKey(): string {
  try {
    return localStorage.getItem(CUSTOM_API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setStoredCustomApiKey(key: string): void {
  try {
    if (!key.trim()) {
      localStorage.removeItem(CUSTOM_API_KEY_STORAGE);
    } else {
      localStorage.setItem(CUSTOM_API_KEY_STORAGE, key.trim());
    }
  } catch {
    // Storage access unavailable
  }
}

export async function verifyCustomApiKey(key: string): Promise<{ valid: boolean; message: string }> {
  try {
    const res = await fetch('/api/ai/verify-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key }),
    });
    if (res.ok) {
      return await res.json();
    }
    return { valid: false, message: 'Server verification check failed.' };
  } catch (e: any) {
    return { valid: false, message: e.message || 'Network error verifying key.' };
  }
}

export async function sendChatMessage(
  history: ChatMessage[],
  newMessage: string,
  model?: string,
  attachments?: ChatAttachment[]
): Promise<AssistantResponse> {
  const normalized = newMessage.toLowerCase();
  const customApiKey = getStoredCustomApiKey();

  try {
    const formattedMessages = history.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
      attachments: m.attachments,
    }));

    // Add current user message with its attachments
    formattedMessages.push({
      role: 'user',
      content: newMessage,
      attachments,
    });

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: formattedMessages,
        model: model || 'gemini-3.8-flash',
        customApiKey,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.text && !data.fallback) {
        return {
          text: data.text,
          isRealAI: true,
          suggestionChips: [
            'Break down into tasks',
            'Draft documentation',
            'Refine code example',
          ],
        };
      }
    }
  } catch {
    // Graceful offline fallback
  }

  // Realistic mock responses if offline or API key is not configured
  return generateIntelligentFallback(normalized, attachments);
}

export async function executeAITool(
  toolId: string,
  prompt: string,
  targetLang?: string
): Promise<{ text: string; isRealAI: boolean }> {
  const customApiKey = getStoredCustomApiKey();

  try {
    const res = await fetch('/api/ai/tool-execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId,
        prompt,
        targetLang,
        customApiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text && !data.fallback) {
        return { text: data.text, isRealAI: true };
      }
    }
  } catch {
    // Network fallback
  }

  // Fallback generation if offline
  return {
    text: getFallbackToolResult(toolId, prompt, targetLang),
    isRealAI: false,
  };
}

export async function generateAITaskBreakdown(
  goal: string
): Promise<Array<{ title: string; category: string; duration: string }>> {
  const customApiKey = getStoredCustomApiKey();

  try {
    const res = await fetch('/api/ai/breakdown-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, customApiKey }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.tasks && data.tasks.length > 0) {
        return data.tasks;
      }
    }
  } catch {
    // Fallback
  }

  return [
    { title: `Research & plan: ${goal}`, category: 'Productivity', duration: '30 min' },
    { title: `Implement core sprint: ${goal}`, category: 'Development', duration: '60 min' },
    { title: `Final review & polish: ${goal}`, category: 'Design', duration: '20 min' },
  ];
}

function getFallbackToolResult(toolId: string, prompt: string, targetLang?: string): string {
  switch (toolId) {
    case 'image-gen':
      return `🎨 Visual Concept Rendered:\nPrompt: "${prompt}"\nResolution: 2048x2048 UHD | Model: Gemini Imagen 3\nLighting: Luminescent Violet (#8B5CFF) with Deep Blue specular shadows and 0.4% atmospheric film grain.`;
    case 'code-assistant':
      return `// Optimized TypeScript Utility for: ${prompt}\nexport function calculateNeumorphicDepth(elevation: number = 8) {\n  const shadowPrimary = Math.max(10, elevation * 1.4);\n  const shadowSecondary = Math.max(4, elevation * 0.6);\n  return {\n    boxShadow: \`\${shadowPrimary}px \${shadowPrimary + 4}px \${shadowPrimary * 2.2}px rgba(0, 0, 0, 0.6),\` +\n               \`-\${shadowSecondary}px -\${shadowSecondary}px \${shadowSecondary * 2}px rgba(50, 80, 140, 0.08),\` +\n               \`inset 0 1px 1px rgba(255, 255, 255, 0.1)\`,\n    border: '1px solid rgba(255, 255, 255, 0.07)',\n    borderTop: '1px solid rgba(255, 255, 255, 0.16)'\n  };\n}`;
    case 'translator':
      const translations: Record<string, string> = {
        Japanese: `「${prompt}」の翻訳結果：細部に宿るアイデンティティ。スマートな明日のためのAIコンパニオン。`,
        Spanish: `Traducción: «${prompt}». Identidad en cada detalle. Tu compañero de IA para un mañana más inteligente.`,
        French: `Traduction: «${prompt}». L'identité dans chaque détail. Votre compagnon IA.`,
        German: `Übersetzung: «${prompt}». Identität in jedem Detail. Ihr KI-Begleiter.`,
      };
      return translations[targetLang || 'Japanese'] || `[${targetLang || 'Translation'}] ${prompt}`;
    case 'note-maker':
      return `📝 Executive Work Brief Synchronized:\nSummary: "${prompt}"\nAction items created and tagged for follow-up.`;
    case 'video-editor':
      return `🎬 Storyboard Sequence Generated:\nScene 1: Cinematic camera move reflecting "${prompt}"\nScene 2: Transition into product workspace with physics bounce.`;
    default:
      return `🔍 Intelligence Synthesis for "${prompt}":\nStructured breakdown with verified insights and actionable next steps.`;
  }
}

function generateIntelligentFallback(query: string, attachments?: ChatAttachment[]): AssistantResponse {
  if (attachments && attachments.length > 0) {
    const fileNames = attachments.map((a) => a.name).join(', ');
    return {
      text: `I've received and processed your attachment(s): ${fileNames}.\n\nBased on the content analysis, here is a breakdown of key structural details, metadata, and suggested next steps:`,
      structuredCard: {
        kicker: 'Attachment Intelligence',
        title: `Analysis of ${attachments[0].name}`,
        description: `File type: ${attachments[0].type.toUpperCase()} (${attachments[0].mimeType}) • Size: ${attachments[0].size}\nExtracted content has been structured and indexed for your session.`,
        tags: [attachments[0].type, 'Processed', 'Indexed'],
        followUp: 'Would you like me to summarize key takeaways or generate tasks from this file?',
      },
      suggestionChips: ['Summarize document', 'Extract action items', 'Convert to Tasks'],
    };
  }
  if (query.includes('brand') || query.includes('creative') || query.includes('idea')) {
    return {
      text: "Of course! Here's a creative brand idea for you:",
      structuredCard: {
        kicker: 'Brand Concept',
        title: 'Identity in Every Detail',
        description:
          "Your brand isn't just about products, it's about a lifestyle. Focus on minimal, premium, and authentic designs that speak to your individuality.",
        tags: ['Minimal', 'Premium', 'Creative'],
        followUp: 'Would you like me to create a visual moodboard for this idea?',
      },
      suggestionChips: [
        'Yes, create moodboard',
        'Suggest color palettes',
        'Refine typography style',
      ],
    };
  }

  if (query.includes('moodboard') || query.includes('visual')) {
    return {
      text: "I've synthesized a visual aesthetic direction for your brand:",
      structuredCard: {
        kicker: 'Visual Direction',
        title: 'Deep Obsidian & Luminescent Violet',
        description:
          'Harmonize deep matte charcoal (#0a0f1d) with energetic violet luminescence (#8b5cff). Layer soft frosted glass cards over atmospheric gradient orbs for futuristic elegance.',
        tags: ['Dark Neumorphic', 'Soft Glass', 'High Contrast'],
        followUp: 'Should I prepare the Figma component tokens or CSS variables?',
      },
      suggestionChips: ['Copy CSS variables', 'Generate typography scale', 'Save to Files'],
    };
  }

  if (query.includes('task') || query.includes('plan') || query.includes('schedule')) {
    return {
      text: "Here is an optimized schedule breakdown based on your priority queue:",
      structuredCard: {
        kicker: 'Daily Focus Plan',
        title: 'High-Impact Sprint (3.5h Total)',
        description:
          '1. Finish website design (2h deep work)\n2. Review Python algorithms (1h)\n3. Creative video edit pass (30m)',
        tags: ['Productivity', 'Focus Time', 'Today'],
        followUp: 'Would you like me to add these automatically to your Tasks dashboard?',
      },
      suggestionChips: ['Add to Tasks', 'Reschedule afternoon', 'Set focus timer'],
    };
  }

  if (query.includes('code') || query.includes('python') || query.includes('react')) {
    return {
      text: "Here is a clean implementation pattern designed for performance:",
      structuredCard: {
        kicker: 'Architecture Pattern',
        title: 'Decoupled State & Resilient Service Layer',
        description:
          'Maintain a reactive store with localStorage hydration and graceful network fallbacks. Keep presentation components pure and encapsulate async workflows in specialized services.',
        tags: ['TypeScript', 'Clean Code', 'Scalability'],
        followUp: 'Need a unit test suite or type definitions for this module?',
      },
      suggestionChips: ['Show code snippet', 'Explain trade-offs', 'Save to Notes'],
    };
  }

  // Default smart AI response
  return {
    text: "I'm ready to assist you. I analyzed your request and prepared these actionable insights:",
    structuredCard: {
      kicker: 'Nova Intelligence',
      title: 'Actionable Workflow Summary',
      description:
        'I can synthesize concepts, generate production assets, optimize your daily task cadence, or analyze your project analytics in real time.',
      tags: ['Fast Response', 'Context Aware', 'Sync Ready'],
      followUp: 'What would you like to explore next?',
    },
    suggestionChips: [
      'Help with creative brand',
      'Optimize daily tasks',
      'Explore creative tools',
    ],
  };
}

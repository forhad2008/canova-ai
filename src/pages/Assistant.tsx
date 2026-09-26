import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  Send,
  Mic,
  Sparkles,
  CheckCheck,
  RotateCcw,
  Volume2,
  Copy,
  Check,
  BookmarkPlus,
  Share2,
} from 'lucide-react';
import { ChatMessage, FileItem } from '../types';
import { NovaStar } from '../components/common/NovaStar';
import { sendChatMessage } from '../services/gemini';
import { soundFx } from '../utils/audio';

interface AssistantProps {
  onBack: () => void;
  initialPrompt?: string;
  onSaveToFile?: (file: Omit<FileItem, 'id'>) => void;
}

export const Assistant: React.FC<AssistantProps> = ({
  onBack,
  initialPrompt,
  onSaveToFile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'Can you help me with a creative idea for my brand?',
      timestamp: '09:41',
    },
    {
      id: 'm2',
      sender: 'assistant',
      text: "Of course! Here's a creative brand idea for you:",
      timestamp: '09:42',
      structuredCard: {
        kicker: 'Brand Concept',
        title: 'Identity in Every Detail',
        description:
          "Your brand isn't just about products, it's about a lifestyle. Focus on minimal, premium, and authentic designs that speak to your individuality.",
        tags: ['Minimal', 'Premium', 'Creative'],
        followUp: 'Would you like me to create a visual moodboard for this idea?',
      },
      suggestionChips: [
        'Yes, create a moodboard',
        'Suggest color schemes',
        'Draft brand mission statement',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    soundFx.playClick();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(messages, query);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredCard: response.structuredCard,
        suggestionChips: response.suggestionChips,
      };

      setMessages((prev) => [...prev, aiMsg]);
      soundFx.playSuccess();
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I couldn't reach the online AI model, but I'm ready to assist you offline.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeak = (text: string, msgId: string) => {
    soundFx.playClick();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speakingId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyMessage = (text: string, msgId: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSaveConceptToFile = (card: { title: string; description: string }) => {
    soundFx.playClick();
    if (onSaveToFile) {
      onSaveToFile({
        name: `${card.title.replace(/\s+/g, '_')}.txt`,
        size: '56 KB',
        date: 'Just now',
        category: 'documents',
        extension: 'txt',
        color: '#8B5CFF',
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  const handleClearHistory = () => {
    soundFx.playClick();
    setMessages([
      {
        id: 'initial',
        sender: 'assistant',
        text: 'Hello Abdullah! What can I help you create, plan, or solve today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestionChips: [
          'Help with brand concept',
          'Optimize my tasks',
          'Review code architecture',
        ],
      },
    ]);
    setShowMenu(false);
  };

  return (
    <div className="relative flex flex-col h-full min-h-[580px] bg-[#F8FAFC] dark:bg-[#030712] select-none transition-colors duration-200">
      {/* 1. Chat Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-[#071329]/90 backdrop-blur-xl border-b border-black/8 dark:border-white/8 shadow-sm dark:shadow-md transition-colors duration-200">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundFx.playClick();
              onBack();
            }}
            aria-label="Back"
            className="w-8 h-8 rounded-full neu-button flex items-center justify-center text-black dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          {/* AI Avatar */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7C4DFF] via-[#3B72FF] to-[#0284C7] dark:from-[#8B5CFF] dark:to-[#35C9FF] p-[1.5px] shadow-[0_2px_10px_rgba(124,77,255,0.35)] dark:shadow-[0_0_14px_rgba(139,92,255,0.45)]">
              <div className="w-full h-full bg-white dark:bg-[#071226] rounded-full flex items-center justify-center">
                <NovaStar size={18} glow={false} />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-[#071226] rounded-full animate-pulse" />
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-black dark:text-white tracking-tight leading-none">
              Canova AI
            </h2>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              Online • Gemini 3.8
            </span>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={() => {
              soundFx.playClick();
              setShowMenu(!showMenu);
            }}
            aria-label="Options"
            className="w-8 h-8 rounded-full neu-button flex items-center justify-center text-black dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl neu-card py-1.5 shadow-2xl z-50 border border-black/8 dark:border-white/10 text-xs">
              <button
                onClick={handleClearHistory}
                className="w-full px-3.5 py-2 text-left text-red-500 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-semibold"
              >
                <RotateCcw size={14} /> Clear Conversation
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    messages.map((m) => `${m.sender}: ${m.text}`).join('\n')
                  );
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left text-slate-800 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Share2 size={14} /> Copy Full Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Notification Toast */}
      {savedNotice && (
        <div className="sticky top-14 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-md flex items-center justify-center gap-1.5 animate-fadeIn">
          <Check size={14} />
          <span>Saved concept to Files Library!</span>
        </div>
      )}

      {/* 2. Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className={`flex items-start gap-2 max-w-[90%] ${isUser ? 'flex-row-reverse' : ''}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B5CFF] to-[#35C9FF] p-[1px] shrink-0 mt-1">
                    <div className="w-full h-full bg-[#071226] rounded-full flex items-center justify-center">
                      <NovaStar size={14} glow={false} />
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed transition-all shadow-md group ${
                    isUser
                      ? 'bg-gradient-to-r from-[#7C4DFF] to-[#3B72FF] text-white rounded-tr-xs shadow-[0_4px_16px_rgba(124,77,255,0.35)]'
                      : 'neu-card text-black dark:text-[#F7F8FF] rounded-tl-xs border border-black/5 dark:border-white/8 bg-white dark:bg-gradient-to-br dark:from-[#0e1c3c] dark:to-[#071329]'
                  }`}
                >
                  <p className="whitespace-pre-line text-[12.5px] font-medium">{msg.text}</p>

                  {/* Structured Card */}
                  {msg.structuredCard && (
                    <div className="mt-3 neu-inset rounded-2xl p-4 border border-purple-500/20 bg-[#F8FAFC] dark:bg-[#060e20] space-y-2">
                      {msg.structuredCard.kicker && (
                        <span className="text-[10px] font-bold text-purple-700 dark:text-[#A978FF] uppercase tracking-wider block">
                          {msg.structuredCard.kicker}
                        </span>
                      )}
                      <h4 className="text-xs font-black text-black dark:text-white">
                        {msg.structuredCard.title}
                      </h4>
                      <p className="text-[11px] text-slate-800 dark:text-[#9AA8C7] font-medium leading-relaxed">
                        {msg.structuredCard.description}
                      </p>

                      {/* Tag Chips */}
                      {msg.structuredCard.tags && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.structuredCard.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Follow up & Save */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/6 mt-2">
                        {msg.structuredCard.followUp && (
                          <p className="text-[10.5px] text-slate-800 dark:text-[#F7F8FF] font-semibold">
                            {msg.structuredCard.followUp}
                          </p>
                        )}
                        <button
                          onClick={() => handleSaveConceptToFile(msg.structuredCard!)}
                          className="neu-button px-2.5 py-1 rounded-lg text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:text-black dark:hover:text-white flex items-center gap-1 shrink-0 ml-2 cursor-pointer shadow-xs"
                        >
                          <BookmarkPlus size={11} />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Action Bar (Speak, Copy, Timestamp) */}
                  <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] opacity-80 font-medium">
                    <div className="flex items-center gap-2">
                      {!isUser && (
                        <>
                          <button
                            onClick={() => handleSpeak(msg.text, msg.id)}
                            className="hover:text-black dark:hover:text-white text-slate-600 dark:text-[#9AA8C7] flex items-center gap-1 cursor-pointer"
                            title="Read Aloud"
                          >
                            <Volume2 size={11} className={speakingId === msg.id ? 'text-purple-600 animate-pulse' : ''} />
                          </button>
                          <button
                            onClick={() => handleCopyMessage(msg.text, msg.id)}
                            className="hover:text-black dark:hover:text-white text-slate-600 dark:text-[#9AA8C7] flex items-center gap-1 cursor-pointer"
                            title="Copy"
                          >
                            {copiedId === msg.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 dark:text-inherit">
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck size={12} className="text-cyan-200" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestion Chips */}
              {msg.suggestionChips && msg.suggestionChips.length > 0 && !isUser && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                  {msg.suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="text-[10.5px] font-semibold px-3 py-1 rounded-full neu-button text-black dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white hover:border-purple-500/40 transition-all cursor-pointer shadow-xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-[#9AA8C7] ml-2 font-medium">
            <div className="w-6 h-6 rounded-full bg-white dark:bg-[#0B1730] flex items-center justify-center border border-purple-500/30 shadow-xs">
              <Sparkles size={12} className="text-purple-600 dark:text-[#A978FF] animate-spin" />
            </div>
            <div className="neu-card rounded-xl px-3 py-2 flex items-center gap-1.5 bg-white">
              <span className="w-1.5 h-1.5 bg-[#8B5CFF] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#4C7DFF] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-[#35C9FF] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice indicator bar with active animated equalizer */}
      {isRecording && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-950/70 dark:to-indigo-950/70 border-t border-purple-500/30 flex items-center justify-between text-xs text-purple-900 dark:text-purple-200">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <div className="flex items-center gap-1 h-5">
              <span className="w-1 bg-purple-600 rounded-full animate-voice-bar-1" />
              <span className="w-1 bg-cyan-600 rounded-full animate-voice-bar-2" />
              <span className="w-1 bg-pink-600 rounded-full animate-voice-bar-3" />
              <span className="w-1 bg-blue-600 rounded-full animate-voice-bar-4" />
            </div>
            <span className="text-[11px] font-bold">Listening to your voice prompt...</span>
          </div>
          <button
            onClick={() => setIsRecording(false)}
            className="text-xs font-bold text-purple-700 underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 3. Bottom Composer */}
      <div className="p-3 bg-white/95 dark:bg-[#071329]/95 backdrop-blur-xl border-t border-black/8 dark:border-white/8 z-20 shadow-[0_-4px_20px_rgba(166,180,204,0.3)] dark:shadow-lg transition-colors duration-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 max-w-xl mx-auto"
        >
          {/* Attach (+) Button */}
          <button
            type="button"
            onClick={() => {
              const demoFiles = ['brand-brief.pdf', 'palette-sample.png', 'ui-tokens.json'];
              const chosen = demoFiles[Math.floor(Math.random() * demoFiles.length)];
              handleSendMessage(`Attached asset: [${chosen}]. Please extract insights.`);
            }}
            aria-label="Add attachment"
            className="w-10 h-10 rounded-full neu-button shrink-0 flex items-center justify-center text-black dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white cursor-pointer shadow-sm"
          >
            <Plus size={18} />
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full neu-inset rounded-full py-2.5 pl-4 pr-10 text-xs font-semibold text-black dark:text-white placeholder-slate-500 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
            {/* Voice toggle */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsRecording(!isRecording);
                if (!isRecording) {
                  setTimeout(() => {
                    setInput('Generate a futuristic cyberpunk brand moodboard description');
                    setIsRecording(false);
                  }, 2200);
                }
              }}
              aria-label="Voice input"
              className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${
                isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500 dark:text-[#657394] hover:text-black dark:hover:text-white'
              }`}
            >
              <Mic size={16} />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              input.trim()
                ? 'neu-primary-btn text-white scale-105 shadow-md'
                : 'neu-button text-slate-400 dark:text-[#657394] opacity-70 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

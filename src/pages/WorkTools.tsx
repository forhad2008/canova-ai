import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  FileText,
  Code,
  Table,
  Save,
  Trash2,
  Clock,
  Zap,
  Mic,
} from 'lucide-react';
import { WorkToolItem } from '../types';
import { soundFx } from '../utils/audio';
import { useVoiceToText } from '../utils/useVoiceToText';

interface WorkToolsProps {
  tools: WorkToolItem[];
  onAddTool: (tool: Omit<WorkToolItem, 'id'>) => void;
  onDeleteTool: (id: string) => void;
}

export const WorkTools: React.FC<WorkToolsProps> = ({
  tools,
  onAddTool,
  onDeleteTool,
}) => {
  // Pomodoro State
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');

  // AI Tool Input
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'summary' | 'code' | 'saved'>('pomodoro');
  const [inputPrompt, setInputPrompt] = useState('');
  const [outputResult, setOutputResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Real Voice-to-Text Dictation
  const { isListening, toggleListening } = useVoiceToText((spoken) => {
    setInputPrompt((prev) => (prev ? `${prev} ${spoken}` : spoken));
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPomoRunning && pomoTime > 0) {
      timer = setInterval(() => setPomoTime((t) => t - 1), 1000);
    } else if (pomoTime === 0 && isPomoRunning) {
      soundFx.playAlarm();
      setIsPomoRunning(false);
      if (pomoMode === 'work') {
        setPomoMode('break');
        setPomoTime(5 * 60);
      } else {
        setPomoMode('work');
        setPomoTime(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isPomoRunning, pomoTime, pomoMode]);

  const formatPomoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleRunAITool = async (toolType: string) => {
    if (!inputPrompt.trim()) return;
    soundFx.playSuccess();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai/tool-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: toolType, prompt: inputPrompt }),
      });
      const data = await res.json();
      setOutputResult(data.text || 'Processing complete.');
    } catch (err) {
      console.error('Work tool execution error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveOutput = () => {
    if (!outputResult) return;
    soundFx.playSuccess();
    onAddTool({
      toolType: activeTab as any,
      title: `${activeTab.toUpperCase()} Output - ${new Date().toLocaleTimeString()}`,
      content: outputResult,
      updatedAt: new Date().toLocaleDateString(),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 text-left">
      {/* Header Banner */}
      <div className="neu-glass-card rounded-3xl p-4 sm:p-6 border border-white/60 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shrink-0">
            <Wrench size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Work & Productivity Tools
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-[#9AA8C7]">
              Pomodoro focus timer, AI code playground, document summarizer, and notes exporter.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="w-full md:w-auto max-w-full overflow-x-auto no-scrollbar p-1.5 rounded-2xl neu-inset bg-black/5 dark:bg-black/20 shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveTab('pomodoro')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'pomodoro' ? 'neu-primary-btn text-white shadow-xs' : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
              }`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'summary' ? 'neu-primary-btn text-white shadow-xs' : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
              }`}
            >
              Summarizer
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'code' ? 'neu-primary-btn text-white shadow-xs' : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
              }`}
            >
              Code Playground
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'saved' ? 'neu-primary-btn text-white shadow-xs' : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
              }`}
            >
              Saved ({tools.length})
            </button>
          </div>
        </div>
      </div>

      {/* 1. Pomodoro Focus Timer */}
      {activeTab === 'pomodoro' && (
        <div className="neu-glass-card rounded-3xl p-8 border border-white/60 dark:border-white/10 text-center space-y-6 max-w-md mx-auto shadow-2xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-300 bg-purple-500/15 px-3 py-1 rounded-full">
            {pomoMode === 'work' ? '🎯 WORK SPRINT (25 MIN)' : '☕ BREAK TIME (5 MIN)'}
          </span>

          <div className="text-6xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tighter">
            {formatPomoTime(pomoTime)}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsPomoRunning(!isPomoRunning);
              }}
              className="px-6 py-3 rounded-2xl neu-primary-btn text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg"
            >
              {isPomoRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isPomoRunning ? 'Pause' : 'Start Sprint'}</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setIsPomoRunning(false);
                setPomoTime(pomoMode === 'work' ? 25 * 60 : 5 * 60);
              }}
              className="p-3 rounded-2xl neu-button text-slate-600 dark:text-[#9AA8C7] hover:text-white cursor-pointer"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 2. AI Document Summarizer & Code Playground */}
      {(activeTab === 'summary' || activeTab === 'code') && (
        <div className="neu-glass-card rounded-3xl p-6 border border-white/60 dark:border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span>{activeTab === 'summary' ? 'AI Document & Note Summarizer' : 'AI Code Assistant & Playground'}</span>
            </h3>

            {/* Voice Dictation Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                toggleListening();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'neu-button text-purple-700 dark:text-purple-300 hover:text-black dark:hover:text-white'
              }`}
            >
              <Mic size={14} />
              <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
            </button>
          </div>

          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            rows={5}
            placeholder={
              activeTab === 'summary'
                ? 'Paste document, report, or dictating thoughts via voice to summarize...'
                : 'Enter code snippet, refactoring request, or dictating architectural notes...'
            }
            className="w-full neu-inset rounded-2xl p-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => handleRunAITool(activeTab === 'summary' ? 'note-maker' : 'code-assistant')}
              disabled={isProcessing || !inputPrompt.trim()}
              className="px-5 py-2.5 rounded-2xl neu-primary-btn text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Sparkles size={16} className={isProcessing ? 'animate-spin' : ''} />
              <span>{isProcessing ? 'Processing...' : 'Run Tool'}</span>
            </button>

            {outputResult && (
              <button
                onClick={handleSaveOutput}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={15} />
                <span>Save to Firestore</span>
              </button>
            )}
          </div>

          {outputResult && (
            <div className="p-4 rounded-2xl neu-inset text-xs leading-relaxed font-mono text-slate-800 dark:text-[#F7F8FF] overflow-x-auto">
              {outputResult}
            </div>
          )}
        </div>
      )}

      {/* 3. Saved Work Outputs */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.length === 0 ? (
            <div className="col-span-full neu-card rounded-2xl p-8 text-center text-xs font-semibold text-slate-500">
              No saved work tool outputs yet. Use the tools above to generate and save outputs!
            </div>
          ) : (
            tools.map((t) => (
              <div key={t.id} className="neu-glass-card rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full">
                      {t.toolType}
                    </span>
                    <button
                      onClick={() => onDeleteTool(t.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{t.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-[#9AA8C7] line-clamp-3 font-mono">{t.content}</p>
                </div>
                <span className="text-[10px] font-medium text-slate-500">{t.updatedAt}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

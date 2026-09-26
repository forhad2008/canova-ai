import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  BookmarkPlus,
} from 'lucide-react';
import { AITool, FileItem } from '../../types';
import { soundFx } from '../../utils/audio';
import { executeAITool } from '../../services/gemini';

interface ToolModalProps {
  tool: AITool | null;
  onClose: () => void;
  onAddNoteToFile?: (file: Omit<FileItem, 'id'>) => void;
}

export const ToolModal: React.FC<ToolModalProps> = ({
  tool,
  onClose,
  onAddNoteToFile,
}) => {
  if (!tool) return null;

  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetLang, setTargetLang] = useState('Japanese');
  const [savedToFile, setSavedToFile] = useState(false);

  const samplePrompts: Record<string, string[]> = {
    'image-gen': [
      'Glowing holographic sphere on dark titanium pedestal with violet neon aura',
      'Cybernetic luxury smart watch with translucent neumorphic glass face',
    ],
    'code-assistant': [
      'Write a TypeScript function to calculate neumorphic layered shadows',
      'React custom hook for debounced window resize with passive listeners',
    ],
    translator: [
      'Identity in every detail. Your AI companion for a smarter tomorrow.',
      'Elevate your daily productivity with minimal modern design.',
    ],
    'note-maker': [
      'Sprint review: Nova AI design tokens launched with 99.8% user satisfaction.',
      'Research: Dark neumorphic interfaces improve focus by 34% in low light.',
    ],
    'video-editor': [
      'Cinematic 4K intro sequence: Camera dolly into glowing purple AI core',
      'High-energy product reveal: Neumorphic cards assembling with physics bounce',
    ],
    'web-search': [
      'Latest benchmarks for Gemini 3.8 Flash vs GPT-4o multimodal reasoning',
      'Modern CSS color-mix and subgrid support across modern browsers 2026',
    ],
  };

  const handleRun = async () => {
    if (!inputVal.trim()) return;
    soundFx.playClick();
    setIsProcessing(true);

    try {
      const result = await executeAITool(tool.id, inputVal.trim(), targetLang);
      setOutputVal(result.text);
      soundFx.playSuccess();
    } catch {
      setOutputVal('An unexpected error occurred while executing the tool.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!outputVal) return;
    soundFx.playClick();
    navigator.clipboard.writeText(outputVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveToFiles = () => {
    if (!outputVal || !onAddNoteToFile) return;
    soundFx.playSuccess();
    onAddNoteToFile({
      name: `${tool.title.replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}.txt`,
      size: '38 KB',
      date: 'Just now',
      category: 'documents',
      extension: 'txt',
      color: tool.accentColor,
    });
    setSavedToFile(true);
    setTimeout(() => setSavedToFile(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="neu-card rounded-3xl p-6 w-full max-w-md border border-black/10 dark:border-purple-500/30 bg-white dark:bg-[#071226] text-left relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: tool.accentColor }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/8 dark:border-white/8 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center neu-inset border border-black/5 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#060e20]"
              style={{ color: tool.accentColor }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-black dark:text-white tracking-tight">
                {tool.title} Studio
              </h3>
              <p className="text-[11px] font-medium text-slate-700 dark:text-[#9AA8C7]">{tool.description}</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full neu-button flex items-center justify-center text-black dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white cursor-pointer shadow-xs"
          >
            <X size={16} />
          </button>
        </div>

        {/* Custom Input depending on tool */}
        <div className="space-y-3 mb-4">
          {tool.id === 'translator' && (
            <div>
              <label className="text-xs font-bold text-black dark:text-[#9AA8C7] block mb-1">
                Target Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full neu-inset rounded-xl py-2 px-3 text-xs font-bold text-black dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none mb-2"
              >
                <option value="Japanese">Japanese (日本語)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-black dark:text-[#9AA8C7] block mb-1">
              Prompt / Input
            </label>
            <textarea
              rows={3}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter your prompt or select a quick starter below..."
              className="w-full neu-inset rounded-xl p-3 text-xs font-medium text-black dark:text-white placeholder-slate-500 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none bg-[#F8FAFC] dark:bg-[#060e20]"
            />
          </div>

          {/* Quick Starter Chips */}
          {samplePrompts[tool.id] && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-700 dark:text-[#657394] uppercase tracking-wide">
                Quick Starters
              </span>
              <div className="flex flex-col gap-1.5">
                {samplePrompts[tool.id].map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      soundFx.playClick();
                      setInputVal(starter);
                    }}
                    className="text-left text-[11px] font-semibold text-slate-800 dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white neu-card-subtle px-2.5 py-1.5 rounded-lg border border-black/5 dark:border-white/5 truncate cursor-pointer transition-colors"
                  >
                    "{starter}"
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={!inputVal.trim() || isProcessing}
            className="w-full neu-primary-btn py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Synthesizing with Nova AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Execute {tool.title}</span>
              </>
            )}
          </button>
        </div>

        {/* Output container */}
        {outputVal && (
          <div className="neu-inset rounded-2xl p-4 border border-purple-500/25 relative animate-fadeIn bg-[#F8FAFC] dark:bg-[#050d1e]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5">
              <span className="text-[11px] font-black text-purple-700 dark:text-[#A978FF]">
                Result Artifact
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToFiles}
                  className="text-black dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  title="Save to Files Vault"
                >
                  {savedToFile ? <Check size={12} className="text-emerald-500" /> : <BookmarkPlus size={12} />}
                  <span>{savedToFile ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="text-black dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <pre className="text-xs text-black dark:text-[#F7F8FF] font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto no-scrollbar">
              {outputVal}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Bot, Sparkles, Send, CheckCircle2, X } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AutonomousAgentBarProps {
  onAgentAction: (data: {
    reply: string;
    tasks?: any[];
    studyMaterials?: any[];
    reminders?: any[];
    workTools?: any[];
  }) => void;
}

export const AutonomousAgentBar: React.FC<AutonomousAgentBarProps> = ({ onAgentAction }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;

    soundFx.playSuccess();
    setIsProcessing(true);
    const userMessage = prompt;
    setPrompt('');

    try {
      const res = await fetch('/api/agent/autonomous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });
      const data = await res.json();
      setLastReply(data.reply || 'Actions executed.');
      onAgentAction(data);
    } catch (err) {
      console.error('Agent execution error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 text-left">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center neu-glass-card rounded-2xl p-1.5 border border-purple-500/30 shadow-lg bg-white/70 dark:bg-[#071228]/80"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shrink-0 ml-1">
          <Bot size={18} />
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Workspace Agent: 'Add task finish homework tomorrow at 4pm and set reminder', 'Make flashcards for Physics'..."
          className="flex-1 bg-transparent border-none py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isProcessing || !prompt.trim()}
          className="px-4 py-2 rounded-xl neu-primary-btn text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
        >
          <Sparkles size={14} className={isProcessing ? 'animate-spin' : ''} />
          <span>{isProcessing ? 'Thinking...' : 'Run Agent'}</span>
        </button>
      </form>

      {lastReply && (
        <div className="mt-2 p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-purple-500 shrink-0" />
            <span>{lastReply}</span>
          </div>
          <button onClick={() => setLastReply(null)} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

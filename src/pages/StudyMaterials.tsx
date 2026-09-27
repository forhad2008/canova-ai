import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  BrainCircuit,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCw,
  FileText,
  HelpCircle,
  X,
  GraduationCap,
} from 'lucide-react';
import { StudyMaterial } from '../types';
import { soundFx } from '../utils/audio';

interface StudyMaterialsProps {
  materials: StudyMaterial[];
  onAddMaterial: (material: Omit<StudyMaterial, 'id'>) => void;
  onDeleteMaterial: (id: string) => void;
}

export const StudyMaterials: React.FC<StudyMaterialsProps> = ({
  materials,
  onAddMaterial,
  onDeleteMaterial,
}) => {
  const [topic, setTopic] = useState('');
  const [materialType, setMaterialType] = useState<'flashcard' | 'note' | 'quiz' | 'summary'>('flashcard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [qIndex: number]: number }>({});
  const [showQuizScore, setShowQuizScore] = useState(false);

  const handleGenerateAI = async () => {
    if (!topic.trim()) return;
    soundFx.playSuccess();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/agent/generate-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, materialType }),
      });
      const data = await res.json();
      if (data.material) {
        onAddMaterial({
          title: data.material.title || `${topic} (${materialType})`,
          type: materialType,
          content: data.material.content || `Study material for ${topic}`,
          subject: data.material.subject || topic,
          createdAt: new Date().toLocaleDateString(),
          flashcards: data.material.flashcards || [],
          quizQuestions: data.material.quizQuestions || [],
        });
        setTopic('');
      }
    } catch (err) {
      console.error('Error generating study material:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'flashcard':
        return <Layers size={18} className="text-purple-500" />;
      case 'quiz':
        return <BrainCircuit size={18} className="text-emerald-500" />;
      case 'summary':
        return <FileText size={18} className="text-blue-500" />;
      default:
        return <BookOpen size={18} className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 text-left">
      {/* Header Banner */}
      <div className="neu-glass-card rounded-3xl p-6 border border-white/60 dark:border-white/10 relative overflow-hidden shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Study Materials & Hub
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-[#9AA8C7]">
              Generate flashcards, notes, practice quizzes, and summaries synced with Firestore.
            </p>
          </div>
        </div>

        {/* Generator Input */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter study topic (e.g., Quantum Physics, Photosynthesis, Organic Chemistry)..."
            className="flex-1 w-full neu-inset rounded-2xl py-3 px-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />

          <select
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value as any)}
            className="neu-inset rounded-2xl py-3 px-3.5 text-xs font-bold text-slate-800 dark:text-white bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="flashcard">Flashcards</option>
            <option value="quiz">Interactive Quiz</option>
            <option value="note">Study Notes</option>
            <option value="summary">Summary</option>
          </select>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating || !topic.trim()}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl neu-primary-btn text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
          </button>
        </div>
      </div>

      {/* Materials Deck Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.length === 0 ? (
          <div className="col-span-full neu-card rounded-2xl p-8 text-center text-xs font-semibold text-slate-500">
            No study materials created yet. Generate your first deck above!
          </div>
        ) : (
          materials.map((m) => (
            <div
              key={m.id}
              className="neu-glass-card rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-purple-500/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIconForType(m.type)}
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full">
                      {m.type}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onDeleteMaterial(m.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{m.title}</h3>
                <p className="text-xs text-slate-600 dark:text-[#9AA8C7] line-clamp-2">{m.content}</p>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">{m.createdAt}</span>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setActiveMaterial(m);
                    setFlashcardIndex(0);
                    setIsFlipped(false);
                    setQuizAnswers({});
                    setShowQuizScore(false);
                  }}
                  className="px-3 py-1.5 rounded-xl neu-button text-xs font-bold text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 cursor-pointer"
                >
                  Open Deck
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Deck Viewer Modal */}
      {activeMaterial && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="neu-glass-card rounded-3xl p-6 w-full max-w-xl border border-purple-500/30 bg-white dark:bg-[#071226] text-left shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                {getIconForType(activeMaterial.type)}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{activeMaterial.title}</h3>
              </div>
              <button
                onClick={() => setActiveMaterial(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Flashcards View Mode */}
            {activeMaterial.type === 'flashcard' && activeMaterial.flashcards && activeMaterial.flashcards.length > 0 && (
              <div className="space-y-4">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[220px] rounded-3xl neu-inset p-8 flex flex-col items-center justify-center text-center cursor-pointer relative transition-transform duration-300 hover:scale-[1.01]"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500 mb-2">
                    {isFlipped ? 'ANSWER' : 'QUESTION (TAP TO REVEAL)'}
                  </span>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {isFlipped
                      ? activeMaterial.flashcards[flashcardIndex]?.answer
                      : activeMaterial.flashcards[flashcardIndex]?.question}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
                  <button
                    disabled={flashcardIndex === 0}
                    onClick={() => {
                      setFlashcardIndex((prev) => Math.max(prev - 1, 0));
                      setIsFlipped(false);
                    }}
                    className="px-4 py-2 rounded-xl neu-button disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span>
                    Card {flashcardIndex + 1} of {activeMaterial.flashcards.length}
                  </span>
                  <button
                    disabled={flashcardIndex === activeMaterial.flashcards.length - 1}
                    onClick={() => {
                      setFlashcardIndex((prev) => Math.min(prev + 1, activeMaterial.flashcards!.length - 1));
                      setIsFlipped(false);
                    }}
                    className="px-4 py-2 rounded-xl neu-button disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Quiz View Mode */}
            {activeMaterial.type === 'quiz' && activeMaterial.quizQuestions && activeMaterial.quizQuestions.length > 0 && (
              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1">
                {activeMaterial.quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 space-y-2 border border-black/5 dark:border-white/5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{qIdx + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = quizAnswers[qIdx] === optIdx;
                        const isCorrect = q.answerIndex === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              soundFx.playClick();
                              setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx });
                            }}
                            className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-transparent border-black/10 dark:border-white/10 text-slate-700 dark:text-[#9AA8C7]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Note / Summary View Mode */}
            {(activeMaterial.type === 'note' || activeMaterial.type === 'summary') && (
              <div className="p-4 rounded-2xl neu-inset text-xs leading-relaxed text-slate-800 dark:text-[#F7F8FF] overflow-y-auto max-h-[350px]">
                {activeMaterial.content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useRef, useEffect } from 'react';
import { History, X, ArrowUpRight } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface RecentSearchesListProps {
  searches: string[];
  onSelect: (search: string) => void;
  onRemove: (search: string) => void;
  onClear: () => void;
  onClose: () => void;
  className?: string;
}

export const RecentSearchesList: React.FC<RecentSearchesListProps> = ({
  searches,
  onSelect,
  onRemove,
  onClear,
  onClose,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (searches.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute top-full left-0 right-0 mt-2 z-50 neu-card rounded-2xl p-2.5 border border-black/10 dark:border-purple-500/25 bg-white/95 dark:bg-[#081226]/95 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.8)] text-left animate-fadeIn ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-black/5 dark:border-white/5">
        <span className="text-[11px] font-bold text-slate-700 dark:text-[#9AA8C7] flex items-center gap-1.5">
          <History size={13} className="text-purple-600 dark:text-[#8B5CFF]" />
          Recent searches
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playClick();
            onClear();
          }}
          className="text-[10px] font-semibold text-slate-500 dark:text-[#657394] hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* List */}
      <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar">
        {searches.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              soundFx.playClick();
              onSelect(item);
            }}
            className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
              <History size={13} className="text-slate-500 dark:text-[#657394] group-hover:text-purple-600 dark:group-hover:text-purple-300 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors truncate">
                {item}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  onRemove(item);
                }}
                aria-label={`Remove ${item}`}
                className="w-5 h-5 rounded-md flex items-center justify-center text-slate-500 dark:text-[#657394] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
              <ArrowUpRight
                size={13}
                className="text-slate-400 dark:text-[#657394] opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

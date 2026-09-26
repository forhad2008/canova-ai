import React, { useRef, useEffect } from 'react';
import { History, X } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface RecentSearchChipsProps {
  searches: string[];
  onSelect: (search: string) => void;
  onRemove: (search: string) => void;
  onClear: () => void;
  onClose?: () => void;
  className?: string;
}

export const RecentSearchChips: React.FC<RecentSearchChipsProps> = ({
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
      const target = event.target as HTMLElement;
      // Do not close if clicking within search input/form
      if (target && (target.closest('input') || target.closest('form'))) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (searches.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`w-full pt-2.5 pb-1 space-y-2 animate-fadeIn select-none ${className}`}
    >
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-700 dark:text-[#9AA8C7]">
        <span className="flex items-center gap-1.5 font-bold">
          <History size={12} className="text-purple-600 dark:text-[#8B5CFF]" />
          Recent searches:
        </span>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playClick();
            onClear();
          }}
          className="text-[11px] font-semibold text-slate-600 dark:text-[#657394] hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* List of chips */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {searches.map((item, idx) => (
          <div
            key={idx}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              soundFx.playClick();
              onSelect(item);
            }}
            className="neu-card rounded-full pl-3 pr-2 py-1.5 flex items-center gap-2 text-xs text-slate-900 dark:text-white border border-black/8 dark:border-white/10 cursor-pointer transition-all hover:border-purple-500/50 hover:bg-purple-500/10 active:scale-95 shadow-xs"
          >
            <span className="truncate max-w-[180px] font-semibold text-slate-800 dark:text-[#E0E7FF]">
              {item}
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                onRemove(item);
              }}
              aria-label={`Remove ${item}`}
              className="w-4 h-4 rounded-full flex items-center justify-center text-slate-600 dark:text-[#657394] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

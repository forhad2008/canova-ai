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
      className={`w-full pt-2 pb-1 space-y-1.5 animate-fadeIn select-none ${className}`}
    >
      <div className="flex items-center justify-between px-1 text-[11px] text-[#9AA8C7]">
        <span className="flex items-center gap-1.5 font-medium">
          <History size={12} className="text-[#8B5CFF]" />
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
          className="text-[10px] text-[#657394] hover:text-red-300 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* List of chips */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {searches.map((item, idx) => (
          <div
            key={idx}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              soundFx.playClick();
              onSelect(item);
            }}
            className="neu-card-subtle group hover:border-purple-500/40 rounded-full pl-3 pr-1.5 py-1 flex items-center gap-1.5 text-xs text-white border border-white/8 cursor-pointer transition-all hover:bg-purple-900/25 active:scale-95 shadow-sm"
          >
            <span className="truncate max-w-[150px] text-[#E0E7FF] group-hover:text-white font-normal">
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
              className="w-4 h-4 rounded-full flex items-center justify-center text-[#657394] hover:text-red-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

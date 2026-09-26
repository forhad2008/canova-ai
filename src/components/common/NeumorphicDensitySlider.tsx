import React from 'react';
import { CloudFog, Sparkles } from 'lucide-react';

interface NeumorphicDensitySliderProps {
  value: number; // 0.1 to 1.0
  onChange: (value: number) => void;
  className?: string;
}

/**
 * Premium Neumorphic Density Slider Control
 * Specifically designed to map to the opacity of the smoke particles in real-time (0.1 to 1.0).
 * Features:
 * - Inset concave track with progress fill glow
 * - Tactile convex thumb with glowing halo & specular sheen
 * - Preset quick-select tags (Light 25%, Med 60%, Dense 90%)
 * - Numeric feedback readout
 */
export const NeumorphicDensitySlider: React.FC<NeumorphicDensitySliderProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const percentage = Math.round(value * 100);
  const trackPercentage = ((value - 0.1) / (1.0 - 0.1)) * 100;

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* Label and Live readout */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg neu-inset flex items-center justify-center text-black dark:text-[#A978FF] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.15)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.8)] border border-black/10 dark:border-purple-500/20">
            <CloudFog size={13} />
          </div>
          <div>
            <span className="text-[11px] font-black text-black dark:text-white tracking-wide block">
              Smoke Density
            </span>
            <span className="text-[9px] text-black dark:text-[#7888AC] font-bold block -mt-0.5">
              Particle Opacity
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/90 dark:bg-[#050C1B] px-2 py-0.5 rounded-lg border border-black/10 dark:border-purple-500/25 neu-inset shadow-xs">
          <Sparkles size={10} className="text-black dark:text-[#35C9FF]" />
          <span className="text-[11px] font-black text-black dark:text-white font-mono min-w-[32px] text-right">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Neumorphic Track & Interactive Slider */}
      <div className="relative pt-1 pb-1">
        {/* Deep Inset Neumorphic Track background */}
        <div className="relative w-full h-3 rounded-full bg-[#040915] neu-inset border border-white/5 overflow-hidden flex items-center px-1">
          {/* Glowing linear gradient fill tracking thumb */}
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-400 shadow-[0_0_10px_rgba(169,120,255,0.7)] transition-[width] duration-75"
            style={{ width: `${trackPercentage}%` }}
          />
        </div>

        {/* Real HTML input slider overlay */}
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.02"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label="Smoke Particle Density Opacity Slider"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />

        {/* Visual Neumorphic Thumb synced to trackPercentage */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full pointer-events-none z-10 transition-transform duration-75"
          style={{
            left: `calc(${trackPercentage}% - ${trackPercentage * 0.18}px)`,
            background:
              'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #D8B4FE 35%, #8B5CF6 75%, #4C1D95 100%)',
            boxShadow:
              '0 2px 10px rgba(139,92,255,0.85), inset 0 1px 2px rgba(255,255,255,0.9), 0 0 14px rgba(169,120,255,0.6)',
            border: '1.5px solid rgba(255,255,255,0.7)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/90 m-auto mt-1 shadow-sm" />
        </div>
      </div>

      {/* Preset Density Quick-Select Buttons */}
      <div className="flex items-center justify-between gap-1 pt-0.5">
        <span className="text-[9px] font-mono font-bold text-black dark:text-[#586888]">0.1 (Min)</span>
        <div className="flex items-center gap-1.5">
          {[
            { label: 'Wispy', val: 0.25 },
            { label: 'Medium', val: 0.6 },
            { label: 'Dense', val: 0.95 },
          ].map((preset) => {
            const isSelected = Math.abs(value - preset.val) < 0.12;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.val)}
                className={`text-[9px] px-2 py-0.5 rounded-md font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white dark:bg-purple-500/25 dark:text-purple-200 border border-black dark:border-purple-400/40 shadow-sm'
                    : 'text-black dark:text-[#6A7B9F] hover:text-black dark:hover:text-[#9AA8C7] hover:bg-black/10 dark:hover:bg-white/5'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <span className="text-[9px] font-mono font-bold text-black dark:text-[#586888]">1.0 (Max)</span>
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { NovaStar } from '../components/common/NovaStar';
import { GlowingOrb } from '../components/common/GlowingOrb';
import { soundFx } from '../utils/audio';

interface SplashProps {
  onStart: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onStart }) => {
  const handleStart = () => {
    soundFx.playSuccess();
    onStart();
  };

  return (
    <div className="relative min-h-[640px] h-full flex flex-col justify-between items-center px-6 py-12 select-none overflow-hidden text-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Top spacing */}
      <div className="w-full flex justify-end">
        <button
          onClick={() => {
            soundFx.playClick();
            onStart();
          }}
          className="text-xs text-[#9AA8C7] hover:text-white px-3.5 py-1.5 rounded-full neu-card-subtle transition-all cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Center AI Hero Artwork */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Organic fluid glowing orb backdrop */}
        <div className="relative flex items-center justify-center">
          <GlowingOrb size={280} />
          
          {/* Centered Large 4-Point Glossy Star */}
          <div className="absolute inset-0 flex items-center justify-center">
            <NovaStar size={88} glow={true} className="animate-subtle-float" />
          </div>
        </div>

        {/* Title and Tagline */}
        <div className="mt-8 space-y-2 max-w-xs">
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_20px_rgba(139,92,255,0.45)]">
            Canova AI
          </h1>
          <p className="text-sm font-medium text-[#9AA8C7] leading-relaxed px-2">
            Your AI Companion for a Smarter Tomorrow
          </p>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="w-full max-w-sm pt-4">
        <button
          onClick={handleStart}
          className="w-full neu-primary-btn group relative flex items-center justify-between px-6 py-4 rounded-full font-semibold text-white tracking-wide cursor-pointer transition-all duration-300 shadow-xl"
        >
          <span className="text-sm font-semibold tracking-wide ml-2">Get Started</span>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-inner">
            <ArrowRight size={18} className="text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};

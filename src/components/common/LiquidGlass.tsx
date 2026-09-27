import React, { useState, useRef } from 'react';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  tint?: 'purple' | 'cyan' | 'amber' | 'emerald' | 'none';
  intensity?: 'subtle' | 'medium' | 'high';
  interactive?: boolean;
  disableTilt?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Liquid Glass Material Component
 * Combines ultra-high transmittance frosted glass, real-time pointer-tracked refraction caustics,
 * chromatic lensing dispersion, and physics-based flex response.
 */
export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  tint = 'purple',
  intensity = 'medium',
  interactive = true,
  disableTilt = true,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50, rotateX: 0, rotateY: 0, isHovered: false, isPressed: false });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 0), 100);
    const yPct = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 0), 100);

    const rotY = disableTilt ? 0 : ((xPct - 50) / 50) * (intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 2.5);
    const rotX = disableTilt ? 0 : -((yPct - 50) / 50) * (intensity === 'high' ? 8 : intensity === 'medium' ? 5 : 2.5);

    setPointer((prev) => ({
      ...prev,
      x: xPct,
      y: yPct,
      rotateX: rotX,
      rotateY: rotY,
      isHovered: true,
    }));
  };

  const handlePointerLeave = () => {
    setPointer((prev) => ({
      ...prev,
      x: 50,
      y: 50,
      rotateX: 0,
      rotateY: 0,
      isHovered: false,
      isPressed: false,
    }));
  };

  const handlePointerDown = () => {
    if (!interactive) return;
    setPointer((prev) => ({ ...prev, isPressed: true }));
  };

  const handlePointerUp = () => {
    if (!interactive) return;
    setPointer((prev) => ({ ...prev, isPressed: false }));
  };

  // Tint mapping
  const tintClasses = {
    purple: 'bg-gradient-to-br from-purple-500/12 via-indigo-500/5 to-white/70 dark:from-purple-900/25 dark:via-indigo-950/15 dark:to-[#081226]/85 border-purple-500/25 dark:border-purple-500/30',
    cyan: 'bg-gradient-to-br from-cyan-500/12 via-blue-500/5 to-white/70 dark:from-cyan-900/25 dark:via-blue-950/15 dark:to-[#081226]/85 border-cyan-500/25 dark:border-cyan-500/30',
    amber: 'bg-gradient-to-br from-amber-500/12 via-orange-500/5 to-white/70 dark:from-amber-900/25 dark:via-orange-950/15 dark:to-[#081226]/85 border-amber-500/25 dark:border-amber-500/30',
    emerald: 'bg-gradient-to-br from-emerald-500/12 via-teal-500/5 to-white/70 dark:from-emerald-900/25 dark:via-teal-950/15 dark:to-[#081226]/85 border-emerald-500/25 dark:border-emerald-500/30',
    none: 'bg-white/65 dark:bg-[#081226]/80 border-white/60 dark:border-white/12',
  }[tint];

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`relative overflow-hidden rounded-3xl backdrop-blur-2xl transition-all duration-300 ${tintClasses} ${
        pointer.isHovered ? 'shadow-[0_22px_60px_-15px_rgba(168,85,247,0.28)] dark:shadow-[0_25px_65px_-15px_rgba(0,0,0,0.85)]' : 'shadow-[0_12px_35px_-10px_rgba(31,38,135,0.08)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)]'
      } ${className}`}
      style={{
        transform: disableTilt
          ? 'none'
          : `perspective(800px) rotateX(${pointer.rotateX}deg) rotateY(${pointer.rotateY}deg) scale(${
              pointer.isPressed ? 0.975 : pointer.isHovered ? 1.01 : 1
            })`,
        transition: pointer.isPressed
          ? 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1)'
          : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), shadow 0.28s ease',
      }}
    >
      {/* 1. Real-time Specular Lens Light Refraction Spot */}
      <div
        className="absolute pointer-events-none rounded-full transition-opacity duration-300"
        style={{
          width: '280px',
          height: '280px',
          top: `${pointer.y}%`,
          left: `${pointer.x}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(168,85,247,0.2) 35%, rgba(56,189,248,0.1) 60%, transparent 80%)',
          opacity: pointer.isHovered ? 1 : 0.35,
          mixBlendMode: 'overlay',
        }}
      />

      {/* 2. Chromatic Lensing Prism Edge Highlights */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(255,255,255,0.8) 0%, transparent 45%)`,
          opacity: pointer.isHovered ? 0.25 : 0.08,
        }}
      />

      {/* 3. High-Refraction Rim Top Light Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none opacity-90 transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) ${pointer.x}%, transparent 100%)`,
        }}
      />

      {/* 4. Left Chromatic Light Edge */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[1.5px] pointer-events-none opacity-80"
        style={{
          background: `linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.6) ${pointer.y}%, transparent 100%)`,
        }}
      />

      {/* Content Slot */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

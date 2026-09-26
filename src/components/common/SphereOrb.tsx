import React, { useState } from 'react';

export type SmokePattern = 'swirl' | 'pulse' | 'stream';
export type SmokeColor = 'white' | 'neon-purple' | 'deep-blue' | 'cyan';

interface SphereOrbProps {
  size?: number;
  className?: string;
  interactive?: boolean;
  vapeOpacity?: number; // 0.1 to 1.0 adjustable opacity
  smokePattern?: SmokePattern; // 'swirl' | 'pulse' | 'stream'
  smokeColor?: SmokeColor; // 'white' | 'neon-purple' | 'deep-blue' | 'cyan'
}

/** Color palette definitions for multi-stop SVG gradients and halos */
const COLOR_CONFIGS: Record<
  SmokeColor,
  {
    primary: { stop0: string; stop35: string; stop70: string };
    secondary: { stop0: string; stop45: string; stop75: string };
    accent: { stop0: string; stop30: string; stop70: string };
    glowHalo: string;
    ambientRing: string;
  }
> = {
  white: {
    primary: { stop0: '#FFFFFF', stop35: '#E2E8F0', stop70: '#94A3B8' },
    secondary: { stop0: '#F8FAFC', stop45: '#CBD5E1', stop75: '#64748B' },
    accent: { stop0: '#FFFFFF', stop30: '#F1F5F9', stop70: '#E2E8F0' },
    glowHalo:
      'radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(203,213,225,0.45) 45%, rgba(148,163,184,0.2) 70%, transparent 85%)',
    ambientRing: 'rgba(255,255,255,0.3)',
  },
  'neon-purple': {
    primary: { stop0: '#D946EF', stop35: '#C084FC', stop70: '#8B5CF6' },
    secondary: { stop0: '#A855F7', stop45: '#C084FC', stop75: '#6366F1' },
    accent: { stop0: '#F5D0FE', stop30: '#E879F9', stop70: '#A855F7' },
    glowHalo:
      'radial-gradient(circle, rgba(192,132,252,0.85) 0%, rgba(168,85,247,0.55) 45%, rgba(139,92,246,0.3) 70%, transparent 85%)',
    ambientRing: 'rgba(168,85,247,0.4)',
  },
  'deep-blue': {
    primary: { stop0: '#3B82F6', stop35: '#2563EB', stop70: '#1D4ED8' },
    secondary: { stop0: '#60A5FA', stop45: '#3B82F6', stop75: '#1E40AF' },
    accent: { stop0: '#93C5FD', stop30: '#3B82F6', stop70: '#1E3A8A' },
    glowHalo:
      'radial-gradient(circle, rgba(59,130,246,0.85) 0%, rgba(37,99,235,0.55) 45%, rgba(30,58,138,0.35) 70%, transparent 85%)',
    ambientRing: 'rgba(59,130,246,0.4)',
  },
  cyan: {
    primary: { stop0: '#06B6D4', stop35: '#22D3EE', stop70: '#0891B2' },
    secondary: { stop0: '#38BDF8', stop45: '#06B6D4', stop75: '#0E7490' },
    accent: { stop0: '#A5F3FC', stop30: '#22D3EE', stop70: '#06B6D4' },
    glowHalo:
      'radial-gradient(circle, rgba(6,182,212,0.85) 0%, rgba(56,189,248,0.55) 45%, rgba(14,116,144,0.35) 70%, transparent 85%)',
    ambientRing: 'rgba(6,182,212,0.4)',
  },
};

/**
 * 3D Iridescent Glowing Sphere Orb with Omnidirectional Continuous 360-degree Smoke Release
 * Mobile Web & App Optimized:
 * - Dynamic pattern mode classes: 'smoke-pattern-swirl', 'smoke-pattern-pulse', 'smoke-pattern-stream'
 * - Real-time Color Palette: 'white', 'neon-purple', 'deep-blue', 'cyan'
 * - Real-time intensity regulation via vapeOpacity (0.1 to 1.0)
 */
export const SphereOrb: React.FC<SphereOrbProps> = ({
  size = 88,
  className = '',
  interactive = true,
  vapeOpacity = 0.8,
  smokePattern = 'swirl',
  smokeColor = 'neon-purple',
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMouseOffset({ x, y });
  };

  const handlePointerLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  // Clamped opacity between 0.1 and 1.0
  const effectiveVapeOpacity = Math.min(1.0, Math.max(0.1, vapeOpacity));

  // Determine dynamic pattern class
  const patternClass = `smoke-pattern-${smokePattern}`;

  // Current color theme gradient stops
  const currentPalette = COLOR_CONFIGS[smokeColor] || COLOR_CONFIGS['neon-purple'];

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative flex items-center justify-center shrink-0 cursor-pointer select-none touch-none ${patternClass} ${className}`}
      style={{
        width: size,
        height: size,
        transform: `perspective(400px) rotateY(${mouseOffset.x}deg) rotateX(${-mouseOffset.y}deg)`,
      }}
    >
      {/* =========================================================
          OMNIDIRECTIONAL 360-DEGREE CONTINUOUS SMOKY VAPE SVG
          Dynamic classes for Swirl, Pulse, and Stream patterns
          Dynamic SVG gradients mapped to selected color palette
          ========================================================= */}
      <svg
        className={`absolute pointer-events-none overflow-visible transition-opacity duration-300 z-10 ${patternClass}`}
        style={{
          width: size * 3.4,
          height: size * 3.4,
          top: -size * 1.2,
          left: -size * 1.2,
          opacity: effectiveVapeOpacity,
        }}
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dynamic palette-mapped vape smoke gradients */}
          <linearGradient id="vapeGradPrimary" x1="10%" y1="90%" x2="90%" y2="10%">
            <stop offset="0%" stopColor={currentPalette.primary.stop0} stopOpacity="0.88" />
            <stop offset="35%" stopColor={currentPalette.primary.stop35} stopOpacity="0.65" />
            <stop offset="70%" stopColor={currentPalette.primary.stop70} stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="vapeGradSecondary" x1="90%" y1="90%" x2="10%" y2="10%">
            <stop offset="0%" stopColor={currentPalette.secondary.stop0} stopOpacity="0.82" />
            <stop offset="45%" stopColor={currentPalette.secondary.stop45} stopOpacity="0.55" />
            <stop offset="75%" stopColor={currentPalette.secondary.stop75} stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="vapeGradAccent" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor={currentPalette.accent.stop0} stopOpacity="0.9" />
            <stop offset="30%" stopColor={currentPalette.accent.stop30} stopOpacity="0.7" />
            <stop offset="70%" stopColor={currentPalette.accent.stop70} stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* SVG Gaussian Blur filters for cloud depth */}
          <filter id="vapeDenseFilter" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="7.5" />
          </filter>

          <filter id="vapeMediumFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>

          <filter id="vapeWispyFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* -----------------------------------------------------------
            1. CONTINUOUS ROTATING SMOKE ORBIT AROUND THE CIRCUMFERENCE
            ----------------------------------------------------------- */}
        <g transform="translate(150, 150)" className="animate-smoke-orbit smoke-pulse-target">
          <circle
            cx="0"
            cy="0"
            r="65"
            fill="none"
            stroke="url(#vapeGradSecondary)"
            strokeWidth="24"
            filter="url(#vapeDenseFilter)"
            strokeDasharray="45 25 35 30"
            opacity="0.65"
          />
          <circle
            cx="0"
            cy="0"
            r="74"
            fill="none"
            stroke="url(#vapeGradPrimary)"
            strokeWidth="18"
            filter="url(#vapeMediumFilter)"
            strokeDasharray="30 40 50 20"
            opacity="0.55"
          />
        </g>

        {/* -----------------------------------------------------------
            2. TOP RELEASES: Upward billowing puffs (Center / North)
            ----------------------------------------------------------- */}
        <path
          d="M 150 150 
             C 135 130, 125 110, 132 90 
             C 138 72, 155 65, 162 48 
             C 170 32, 160 20, 168 5 
             C 180 18, 175 42, 166 60 
             C 158 78, 168 95, 162 118 
             C 158 135, 154 145, 150 150 Z"
          fill="url(#vapeGradPrimary)"
          filter="url(#vapeDenseFilter)"
          className="animate-smoke-release-1 smoke-stream-target smoke-swirl-target"
          style={{ transformOrigin: '150px 150px' }}
        />

        <path
          d="M 145 152 
             C 125 135, 115 112, 124 92 
             C 132 75, 148 68, 156 50 
             C 166 32, 152 20, 158 2 
             C 170 16, 164 40, 156 58 
             C 148 76, 160 96, 154 120 
             C 150 138, 148 148, 145 152 Z"
          fill="url(#vapeGradAccent)"
          filter="url(#vapeMediumFilter)"
          className="animate-smoke-release-2 smoke-stream-target"
          style={{ transformOrigin: '145px 152px' }}
        />

        {/* -----------------------------------------------------------
            3. NORTH-WEST & WEST RELEASES: Smoke billowing leftward
            ----------------------------------------------------------- */}
        <path
          d="M 150 150 
             C 128 142, 108 135, 96 120 
             C 84 105, 90 88, 76 74 
             C 62 60, 48 56, 35 44 
             C 50 48, 68 62, 82 78 
             C 96 94, 98 114, 118 126 
             C 134 136, 144 145, 150 150 Z"
          fill="url(#vapeGradSecondary)"
          filter="url(#vapeDenseFilter)"
          className="animate-smoke-nw-1 smoke-horizontal-billow smoke-pulse-target"
          style={{ transformOrigin: '150px 150px' }}
        />

        <path
          d="M 148 155 
             C 122 152, 98 145, 84 132 
             C 70 120, 72 102, 56 90 
             C 42 78, 30 76, 18 65 
             C 32 68, 48 82, 64 98 
             C 80 114, 82 132, 104 142 
             C 122 150, 138 154, 148 155 Z"
          fill="url(#vapeGradPrimary)"
          filter="url(#vapeMediumFilter)"
          className="animate-smoke-nw-2 smoke-horizontal-billow"
          style={{ transformOrigin: '148px 155px' }}
        />

        {/* Pure West Horizontal Billow */}
        <path
          d="M 145 152 
             C 120 148, 95 146, 75 140 
             C 55 134, 48 122, 28 118 
             C 42 128, 62 138, 82 148 
             C 105 158, 126 156, 145 152 Z"
          fill="url(#vapeGradAccent)"
          filter="url(#vapeDenseFilter)"
          className="animate-smoke-west-1 smoke-horizontal-billow"
          style={{ transformOrigin: '145px 152px' }}
        />

        {/* -----------------------------------------------------------
            4. NORTH-EAST & EAST RELEASES: Smoke billowing rightward
            ----------------------------------------------------------- */}
        <path
          d="M 150 150 
             C 172 142, 192 135, 204 120 
             C 216 105, 210 88, 224 74 
             C 238 60, 252 56, 265 44 
             C 250 48, 232 62, 218 78 
             C 204 94, 202 114, 182 126 
             C 166 136, 156 145, 150 150 Z"
          fill="url(#vapeGradPrimary)"
          filter="url(#vapeDenseFilter)"
          className="animate-smoke-ne-1 smoke-horizontal-billow smoke-pulse-target"
          style={{ transformOrigin: '150px 150px' }}
        />

        <path
          d="M 152 155 
             C 178 152, 202 145, 216 132 
             C 230 120, 228 102, 244 90 
             C 258 78, 270 76, 282 65 
             C 268 68, 252 82, 236 98 
             C 220 114, 218 132, 196 142 
             C 178 150, 162 154, 152 155 Z"
          fill="url(#vapeGradSecondary)"
          filter="url(#vapeMediumFilter)"
          className="animate-smoke-ne-2 smoke-horizontal-billow"
          style={{ transformOrigin: '152px 155px' }}
        />

        {/* Pure East Horizontal Billow */}
        <path
          d="M 155 152 
             C 180 148, 205 146, 225 140 
             C 245 134, 252 122, 272 118 
             C 258 128, 238 138, 218 148 
             C 195 158, 174 156, 155 152 Z"
          fill="url(#vapeGradAccent)"
          filter="url(#vapeDenseFilter)"
          className="animate-smoke-east-1 smoke-horizontal-billow"
          style={{ transformOrigin: '155px 152px' }}
        />

        {/* -----------------------------------------------------------
            5. SOUTH RELEASES: Downward drifting vapor pooling at the base
            ----------------------------------------------------------- */}
        <path
          d="M 150 155 
             C 132 172, 126 195, 134 216 
             C 140 232, 162 242, 158 260 
             C 168 245, 174 225, 166 208 
             C 160 190, 164 172, 150 155 Z"
          fill="url(#vapeGradSecondary)"
          filter="url(#vapeDenseFilter)"
          className="animate-smoke-south smoke-horizontal-billow"
          style={{ transformOrigin: '150px 155px' }}
        />

        {/* -----------------------------------------------------------
            6. FINE SURFACE TENDRILS & CLOSE-ORBIT WISPS
            ----------------------------------------------------------- */}
        <path
          d="M 115 160 
             C 90 145, 88 120, 102 102 
             C 116 84, 142 80, 152 64 
             C 162 48, 154 38, 160 34 
             C 164 46, 148 58, 140 70 
             C 130 84, 106 86, 96 104 
             C 88 118, 92 136, 115 160 Z"
          fill="url(#vapeGradPrimary)"
          filter="url(#vapeWispyFilter)"
          className="animate-smoke-curl-1 smoke-swirl-target"
          style={{ transformOrigin: '150px 150px', animationDelay: '-1.5s' }}
        />

        <path
          d="M 185 160 
             C 210 145, 212 120, 198 102 
             C 184 84, 158 80, 148 64 
             C 138 48, 146 38, 140 34 
             C 136 46, 152 58, 160 70 
             C 170 84, 194 86, 204 104 
             C 212 118, 208 136, 185 160 Z"
          fill="url(#vapeGradSecondary)"
          filter="url(#vapeWispyFilter)"
          className="animate-smoke-curl-2 smoke-swirl-target"
          style={{ transformOrigin: '150px 150px', animationDelay: '-2.5s' }}
        />
      </svg>

      {/* Outer ambient glow halo (matches selected palette) */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-80 animate-glow-pulse pointer-events-none transition-all duration-500"
        style={{
          background: currentPalette.glowHalo,
          transform: 'scale(1.45)',
          opacity: 0.4 + effectiveVapeOpacity * 0.5,
        }}
      />

      {/* Outer subtle glass refraction ring */}
      <div
        className="absolute inset-0 rounded-full border border-white/20 p-[2px] transition-colors duration-500 pointer-events-none"
        style={{
          boxShadow: `0 0 15px ${currentPalette.ambientRing}`,
        }}
      >
        <div className="w-full h-full rounded-full border border-white/10" />
      </div>

      {/* Authentic 3D Iridescent Sphere Body */}
      <div
        className="w-full h-full rounded-full relative overflow-hidden shadow-[inset_0_-10px_20px_rgba(5,10,30,0.9),inset_0_4px_16px_rgba(255,255,255,0.6),0_12px_30px_rgba(0,0,0,0.6)] border border-purple-200/30"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #f3e8ff 0%, #c084fc 25%, #8b5cf6 45%, #3b82f6 72%, #0f172a 100%)',
        }}
      >
        {/* Specular high-light glint with smooth response */}
        <div
          className="absolute top-2 left-2 rounded-full opacity-85 pointer-events-none transition-all duration-150"
          style={{
            width: size * 0.38,
            height: size * 0.24,
            background:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 80%)',
            transform: `rotate(-30deg) translate(${mouseOffset.x * 0.2}px, ${mouseOffset.y * 0.2}px)`,
          }}
        />

        {/* Secondary rim light */}
        <div
          className="absolute bottom-1 right-2 rounded-full opacity-70 pointer-events-none"
          style={{
            width: size * 0.45,
            height: size * 0.22,
            background:
              'radial-gradient(ellipse at center, rgba(53,201,255,0.9) 0%, rgba(53,201,255,0) 80%)',
            transform: 'rotate(20deg)',
          }}
        />

        {/* Interior celestial shimmer */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8), transparent 60%)',
          }}
        />

        {/* Internal vapor wisps inside the translucent glass sphere modulated by vapeOpacity & currentPalette */}
        <div
          className="absolute inset-0 rounded-full mix-blend-screen pointer-events-none animate-smoke-curl-1 transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse at 40% 60%, ${currentPalette.primary.stop35} 0%, ${currentPalette.secondary.stop45} 40%, transparent 70%)`,
            filter: 'blur(5px)',
            opacity: effectiveVapeOpacity * 0.5,
          }}
        />
      </div>
    </div>
  );
};

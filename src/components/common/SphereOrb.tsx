import React, { useState } from 'react';

export type WaterFlowPattern = 'wave' | 'swirl' | 'ripple' | 'pulse' | 'stream';
export type WaterColor = 'cyan' | 'deep-blue' | 'neon-purple' | 'white';

// Backwards-compatible type aliases
export type SmokePattern = WaterFlowPattern;
export type SmokeColor = WaterColor;

interface SphereOrbProps {
  size?: number;
  className?: string;
  interactive?: boolean;
  vapeOpacity?: number;
  smokePattern?: WaterFlowPattern;
  smokeColor?: WaterColor;
}

/**
 * Dynamic 3D Round Planet Vector SVG Component
 * Features vector planetary continents, rotating cosmic ion rings, atmospheric aurora glow, and an orbiting moon.
 */
export const SphereOrb: React.FC<SphereOrbProps> = ({
  size = 92,
  className = '',
  interactive = true,
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 22;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 22;
    setMouseOffset({ x, y });
  };

  const handlePointerLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative flex items-center justify-center shrink-0 cursor-pointer select-none touch-none ${className}`}
      style={{
        width: size,
        height: size,
        transform: `perspective(500px) rotateY(${mouseOffset.x}deg) rotateX(${-mouseOffset.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* 1. Atmospheric Deep Cosmic Glow Halo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-80 pointer-events-none animate-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.75) 0%, rgba(56,189,248,0.5) 45%, rgba(99,102,241,0.25) 75%, transparent 95%)',
          transform: 'scale(1.5)',
        }}
      />

      {/* 2. Main Planet Vector Canvas */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible drop-shadow-[0_10px_25px_rgba(99,102,241,0.5)]"
      >
        <defs>
          {/* Planet 3D Sphere Surface Gradient */}
          <radialGradient id="planetBodyGrad" cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="18%" stopColor="#C084FC" />
            <stop offset="42%" stopColor="#8B5CF6" />
            <stop offset="68%" stopColor="#4338CA" />
            <stop offset="90%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>

          {/* Atmospheric Corona Edge Highlight */}
          <radialGradient id="atmosphereRim" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0" />
            <stop offset="92%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.9" />
          </radialGradient>

          {/* Continental / Nebula Swirl Gradient */}
          <linearGradient id="continentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0.45" />
          </linearGradient>

          {/* Planetary Ring Multi-Stop Spectrum */}
          <linearGradient id="planetaryRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#E879F9" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="75%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.95" />
          </linearGradient>

          {/* Ring Back Shadow Clip */}
          <linearGradient id="ringShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 3. Back Portion of Planetary Ring (behind planet body) */}
        <g transform="rotate(-22 50 50)">
          <ellipse
            cx="50"
            cy="50"
            rx="46"
            ry="14"
            fill="none"
            stroke="url(#planetaryRingGrad)"
            strokeWidth="3.5"
            opacity="0.55"
            strokeDasharray="120 120"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="11"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.2"
            opacity="0.4"
          />
        </g>

        {/* 4. Planet Sphere Solid Body */}
        <circle cx="50" cy="50" r="32" fill="url(#planetBodyGrad)" />

        {/* 5. Vector Continent & Atmospheric Cloud Swirls */}
        <g clipPath="url(#planetClip)">
          <clipPath id="planetClip">
            <circle cx="50" cy="50" r="31.5" />
          </clipPath>

          {/* Swirling Continental Mass 1 */}
          <path
            d="M 28 35 Q 40 28, 55 38 T 72 48 Q 62 62, 45 58 T 28 35 Z"
            fill="url(#continentGrad)"
            opacity="0.7"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 8,2; 0,0"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>

          {/* Swirling Continental Mass 2 */}
          <path
            d="M 22 55 Q 38 68, 58 64 T 76 60 Q 65 78, 40 76 T 22 55 Z"
            fill="url(#continentGrad)"
            opacity="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -6,-3; 0,0"
              dur="15s"
              repeatCount="indefinite"
            />
          </path>

          {/* Polar Ice Cap / Aurora Crown */}
          <ellipse cx="46" cy="21" rx="16" ry="6" fill="#FFFFFF" opacity="0.65" />
          <ellipse cx="54" cy="79" rx="14" ry="5" fill="#38BDF8" opacity="0.45" />

          {/* 3D Spherical Shadow Arc */}
          <path
            d="M 50 18 A 32 32 0 0 1 82 50 A 32 32 0 0 1 50 82 A 32 32 0 0 0 74 50 A 32 32 0 0 0 50 18 Z"
            fill="url(#ringShadow)"
            opacity="0.8"
          />
        </g>

        {/* 6. Atmospheric Corona Rim */}
        <circle cx="50" cy="50" r="32" fill="url(#atmosphereRim)" />

        {/* 7. Front Portion of Planetary Ring (in front of planet body) */}
        <g transform="rotate(-22 50 50)">
          <path
            d="M 4 50 A 46 14 0 0 0 96 50"
            fill="none"
            stroke="url(#planetaryRingGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 10 50 A 40 11 0 0 0 90 50"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            opacity="0.8"
          />
          <path
            d="M 16 50 A 34 8 0 0 0 84 50"
            fill="none"
            stroke="#E879F9"
            strokeWidth="1"
            opacity="0.6"
          />
        </g>

        {/* 8. High Specular Star Glint on Planet Surface */}
        <circle
          cx={32 + mouseOffset.x * 0.2}
          cy={28 + mouseOffset.y * 0.2}
          r="4.5"
          fill="#FFFFFF"
          opacity="0.95"
        />
        <circle
          cx={32 + mouseOffset.x * 0.2}
          cy={28 + mouseOffset.y * 0.2}
          r="9"
          fill="#FFFFFF"
          opacity="0.35"
        />

        {/* 9. Orbiting Satellite Moon */}
        <g>
          <circle cx="50" cy="50" r="44" fill="none" />
          <g>
            <circle cx="88" cy="30" r="3.5" fill="#FFFFFF" />
            <circle
              cx="88"
              cy="30"
              r="6.5"
              fill="#38BDF8"
              opacity="0.5"
              className="animate-ping"
            />
          </g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="10s"
            repeatCount="indefinite"
          />
        </g>
      </svg>
    </div>
  );
};

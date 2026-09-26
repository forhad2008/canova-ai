import React from 'react';
import { STAR_BASE64 } from '../../assets/starData';

interface NovaStarProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

/**
 * 3D Faceted Nova Star SVG Component
 * Powered by user-provided custom 3D star asset (svg.png)
 */
export const NovaStar: React.FC<NovaStarProps> = ({
  size = 40,
  className = '',
  glow = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-85 animate-pulse pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(169,120,255,0.85) 0%, rgba(99,102,241,0.5) 45%, rgba(56,189,248,0.25) 70%, transparent 90%)',
            transform: 'scale(1.45)',
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_2px_14px_rgba(139,92,255,0.65)]"
      >
        <image
          href={STAR_BASE64}
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    </div>
  );
};


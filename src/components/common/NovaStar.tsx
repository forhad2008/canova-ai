import React from 'react';

interface NovaStarProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

/**
 * 3D Faceted Nova Star SVG Component
 * Pure vector SVG rendering with 3D diamond facets, specular lighting, and glowing halo
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
          className="absolute inset-0 rounded-full blur-md opacity-80 animate-pulse pointer-events-none"
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
        className="relative z-10 drop-shadow-[0_4px_16px_rgba(139,92,255,0.65)]"
      >
        <defs>
          {/* Specular Linear Gradients for 3D Diamond Facets */}
          <linearGradient id="starFacetTopLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#C084FC" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="starFacetTopRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E879F9" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#A855F7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="starFacetBottomLeft" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="starFacetBottomRight" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.9" />
          </linearGradient>

          {/* Central Specular Core Glow */}
          <radialGradient id="starCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="40%" stopColor="#F5D0FE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Outer Star Rays */}
        <path
          d="M 50 0 L 58 42 L 100 50 L 58 58 L 50 100 L 42 58 L 0 50 L 42 42 Z"
          fill="url(#starFacetTopLeft)"
          opacity="0.95"
        />

        {/* 2. Facet Triangles for Authentic 3D Depth */}
        {/* Top-North Facet */}
        <polygon points="50,0 50,50 58,42" fill="url(#starFacetTopRight)" />
        <polygon points="50,0 50,50 42,42" fill="url(#starFacetTopLeft)" />

        {/* Right-East Facet */}
        <polygon points="100,50 50,50 58,42" fill="url(#starFacetTopLeft)" />
        <polygon points="100,50 50,50 58,58" fill="url(#starFacetBottomRight)" />

        {/* Bottom-South Facet */}
        <polygon points="50,100 50,50 58,58" fill="url(#starFacetBottomRight)" />
        <polygon points="50,100 50,50 42,58" fill="url(#starFacetBottomLeft)" />

        {/* Left-West Facet */}
        <polygon points="0,50 50,50 42,58" fill="url(#starFacetBottomLeft)" />
        <polygon points="0,50 50,50 42,42" fill="url(#starFacetTopRight)" />

        {/* 3. Secondary Diagonal Flare Points */}
        <path
          d="M 50 15 L 55 45 L 85 50 L 55 55 L 50 85 L 45 55 L 15 50 L 45 45 Z"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.5"
          transform="rotate(45 50 50)"
        />

        {/* 4. Central High-Luminance Core */}
        <circle cx="50" cy="50" r="14" fill="url(#starCoreGlow)" />
        <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};



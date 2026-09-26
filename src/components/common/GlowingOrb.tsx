import React from 'react';

interface GlowingOrbProps {
  className?: string;
  size?: number;
}

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  className = '',
  size = 280,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Deep atmospheric backdrop glow */}
      <div
        className="absolute rounded-full blur-[65px] opacity-60 animate-glow-pulse"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          background:
            'radial-gradient(circle, rgba(139,92,255,0.75) 0%, rgba(76,125,255,0.45) 45%, rgba(53,201,255,0.2) 70%, transparent 85%)',
        }}
      />

      {/* Layer 1: Deep Cobalt/Indigo outer fluid silhouette */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full absolute inset-0 animate-subtle-float opacity-75"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="nebulaDarkGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#0f172a" stopOpacity="0.7" />
            <stop offset="90%" stopColor="#020617" stopOpacity="0.2" />
          </radialGradient>
          <filter id="softGlowOrb" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <path
          fill="url(#nebulaDarkGrad)"
          filter="url(#softGlowOrb)"
          d="M45.5,-63.2C59.7,-55.4,72.6,-43.3,77.8,-28.4C83,-13.4,80.5,4.5,74.1,20.2C67.7,36,57.5,49.6,44.2,59.3C30.9,69,14.5,74.9,-1.2,76.5C-16.8,78.2,-33.7,75.7,-47.5,66.7C-61.4,57.8,-72.3,42.4,-77.8,25.5C-83.3,8.5,-83.4,-10,-76.4,-25.7C-69.4,-41.4,-55.4,-54.3,-40.4,-61.9C-25.5,-69.5,-9.5,-71.8,4.5,-78C18.5,-84.2,31.4,-71.1,45.5,-63.2Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Layer 2: Ethereal Violet/Cyan organic ribbon */}
      <svg
        viewBox="0 0 200 200"
        className="w-[90%] h-[90%] absolute inset-0 m-auto animate-pulse opacity-85"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="nebulaColorGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#818CF8" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#38BDF8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
          </radialGradient>
          <filter id="ribbonBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <path
          fill="url(#nebulaColorGrad)"
          filter="url(#ribbonBlur)"
          d="M48.2,-64.1C62.1,-55.8,72.6,-41.4,76.5,-25.5C80.3,-9.6,77.5,7.8,70.5,23.3C63.5,38.8,52.2,52.4,37.8,61.7C23.4,71,5.9,76,-11.2,74.5C-28.3,73,-45.1,65,-57.4,52.8C-69.8,40.7,-77.7,24.4,-78.9,7.6C-80.1,-9.1,-74.6,-26.3,-64.2,-39.3C-53.7,-52.3,-38.3,-61.2,-23,-65.7C-7.6,-70.2,7.7,-70.4,22.8,-67.2C37.9,-64,52.6,-57.4,48.2,-64.1Z"
          transform="translate(100 100)"
        />
      </svg>
    </div>
  );
};

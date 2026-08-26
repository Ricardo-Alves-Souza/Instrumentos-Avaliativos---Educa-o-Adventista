import React from 'react';

interface AdventistLogoProps {
  className?: string;
  size?: number;
}

export const AdventistLogo: React.FC<AdventistLogoProps> = ({
  className = '',
  size = 42,
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: (size * 88) / 100 }}
      aria-label="Logo Colégio Adventista"
    >
      <img
        src="/logo.jpeg"
        alt="Logo Colégio Adventista"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};



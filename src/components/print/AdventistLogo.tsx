import React from 'react';

interface AdventistLogoProps {
  className?: string;
  size?: number;
}

export const AdventistLogo: React.FC<AdventistLogoProps> = ({
  className = '',
  size = 42,
}) => {
  const height = Math.round((size * 88) / 100);

  return (
    <div
      className={`adventist-logo-container inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        maxWidth: `${size}px`,
        minWidth: `${size}px`,
        height: `${height}px`,
        maxHeight: `${height}px`,
      }}
      aria-label="Logo Colégio Adventista"
    >
      <img
        src="/logo.jpeg"
        alt="Logo Colégio Adventista"
        className="adventist-logo-img w-full h-full object-contain block"
        style={{
          width: `${size}px`,
          maxWidth: `${size}px`,
          height: `${height}px`,
          maxHeight: `${height}px`,
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};



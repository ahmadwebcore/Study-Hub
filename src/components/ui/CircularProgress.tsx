import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showText?: boolean;
  text?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 52,
  strokeWidth = 4.5,
  color = '#14B866',
  trackColor = '#E7EFEA',
  showText = true,
  text,
  className = '',
}) => {
  const cleanPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cleanPercentage / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showText && (
        <span
          className="absolute text-[11px] font-bold text-[#142D27] tracking-tight"
          style={{ fontSize: size <= 48 ? '10px' : '11px' }}
        >
          {text !== undefined ? text : `${cleanPercentage}%`}
        </span>
      )}
    </div>
  );
};

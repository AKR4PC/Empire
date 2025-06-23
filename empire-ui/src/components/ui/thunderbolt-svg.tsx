import React from "react";

interface ThunderboltSVGProps {
  className?: string;
  color?: string;
}

export const ThunderboltSVG = ({ 
  className = "", 
  color = "#ffffff" 
}: ThunderboltSVGProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 100" 
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12,0 L8,30 L16,40 L4,70 L20,60 L12,100" />
      <path 
        d="M12,0 L8,30 L16,40 L4,70 L20,60 L12,100" 
        strokeOpacity="0.6"
        strokeWidth="3"
        filter="blur(2px)"
      />
      <path 
        d="M12,0 L8,30 L16,40 L4,70 L20,60 L12,100" 
        strokeOpacity="0.3"
        strokeWidth="5"
        filter="blur(4px)"
      />
    </svg>
  );
}; 
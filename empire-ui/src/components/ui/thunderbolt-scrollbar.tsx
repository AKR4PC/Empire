"use client";

import React, { useEffect, useRef, useState } from "react";
import { ThunderboltSVG } from "./thunderbolt-svg";

interface ThunderboltScrollbarProps {
  className?: string;
  containerRef?: React.RefObject<HTMLElement>;
}

export const ThunderboltScrollbar = ({
  className = "",
  containerRef
}: ThunderboltScrollbarProps) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const thunderboltRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const element = containerRef?.current || window;
      const scrollTop = containerRef?.current ? containerRef.current.scrollTop : window.scrollY;
      const scrollHeight = containerRef?.current ? 
        containerRef.current.scrollHeight - containerRef.current.clientHeight : 
        document.documentElement.scrollHeight - window.innerHeight;
      
      const percentage = (scrollTop / scrollHeight) * 100;
      setScrollPercentage(percentage);
      
      if (thunderboltRef.current) {
        thunderboltRef.current.style.top = `${percentage}%`;
      }
      
      if (glowRef.current) {
        glowRef.current.style.top = `${percentage}%`;
      }
    };
    
    const target = containerRef?.current || window;
    target.addEventListener('scroll', handleScroll);
    
    // Initial position
    handleScroll();
    
    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);
  
  return (
    <div 
      className={`fixed right-2 top-1/2 transform -translate-y-1/2 h-[60vh] w-6 z-50 ${className}`}
      ref={scrollTrackRef}
    >
      <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent via-[#121212] to-transparent"></div>
      
      <div 
        ref={thunderboltRef}
        className="absolute left-0 transform -translate-y-1/2 w-6 h-12 transition-all duration-300 ease-out"
        style={{ top: `${scrollPercentage}%` }}
      >
        <ThunderboltSVG 
          className="w-full h-full" 
          color="rgba(79, 70, 229, 0.9)" 
        />
      </div>
      
      <div 
        ref={glowRef}
        className="absolute left-0 transform -translate-y-1/2 w-6 h-24 pointer-events-none"
        style={{ top: `${scrollPercentage}%` }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#4f46e5] rounded-full opacity-20 blur-xl"></div>
      </div>
    </div>
  );
}; 
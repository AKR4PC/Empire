"use client";

import React, { useEffect, useRef, useState } from "react";

interface NeonDotGridProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  dotSpacing?: number;
  glowColor?: string;
  glowIntensity?: number;
}

export const NeonDotGrid = ({
  className = "",
  dotColor = "rgba(255, 255, 255, 0.2)",
  dotSize = 1,
  dotSpacing = 30,
  glowColor = "rgba(255, 255, 255, 0.8)",
  glowIntensity = 0.8
}: NeonDotGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isActive, setIsActive] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number>(0);
  const dotsRef = useRef<{ x: number; y: number; brightness: number; size: number }[]>([]);
  
  // Set up canvas and dots
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      
      // Create dot grid
      const dots: { x: number; y: number; brightness: number; size: number }[] = [];
      const cols = Math.ceil(window.innerWidth / dotSpacing);
      const rows = Math.ceil(window.innerHeight / dotSpacing);
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            x: i * dotSpacing,
            y: j * dotSpacing,
            brightness: 0.1 + Math.random() * 0.1, // Base brightness
            size: dotSize * (0.8 + Math.random() * 0.4) // Varied dot sizes
          });
        }
      }
      
      dotsRef.current = dots;
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dotSpacing, dotSize]);
  
  // Handle mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseDown = () => {
      setIsActive(true);
    };
    
    const handleMouseUp = () => {
      setIsActive(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw glow effect
      const glow = isActive ? glowIntensity * 1.5 : glowIntensity;
      const radius = isActive ? 200 : 150;
      
      // Draw dots with enhanced effect
      dotsRef.current.forEach(dot => {
        // Calculate distance from mouse
        const dx = mousePosition.x - dot.x;
        const dy = mousePosition.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate brightness based on distance from mouse
        let brightness = dot.brightness;
        if (distance < radius) {
          const intensity = 1 - distance / radius;
          brightness = Math.min(1, dot.brightness + intensity * glow);
        }
        
        // Draw the dot with dynamic size based on brightness
        const dynamicSize = dot.size * (1 + brightness * 0.5);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dynamicSize, 0, Math.PI * 2);
        
        // Parse the rgba color and adjust brightness
        const color = dotColor.replace('rgba(', '').replace(')', '').split(',');
        const r = color[0].trim();
        const g = color[1].trim();
        const b = color[2].trim();
        const a = parseFloat(color[3].trim()) * brightness;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fill();
        
        // Add subtle halo effect for brighter dots
        if (brightness > 0.5) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dynamicSize * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.2})`;
          ctx.fill();
        }
      });
      
      // Draw mouse glow with enhanced effect
      const gradient = ctx.createRadialGradient(
        mousePosition.x, 
        mousePosition.y, 
        0, 
        mousePosition.x, 
        mousePosition.y, 
        radius
      );
      
      // Parse the glow color to create proper RGBA values
      const baseColor = glowColor.replace('rgba(', '').replace(')', '').split(',');
      const r = baseColor[0].trim();
      const g = baseColor[1].trim();
      const b = baseColor[2].trim();
      
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${isActive ? 0.5 : 0.3})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${isActive ? 0.3 : 0.15})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      // Add subtle noise texture for more visual interest
      if (isActive) {
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 1 + 0.5;
          const opacity = Math.random() * 0.05;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [mousePosition, isActive, dotColor, dotSize, glowColor, glowIntensity]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full pointer-events-none z-0 ${className}`}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
}; 
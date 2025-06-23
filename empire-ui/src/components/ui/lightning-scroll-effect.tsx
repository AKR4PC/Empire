"use client";

import React, { useEffect, useRef } from "react";

interface LightningScrollEffectProps {
  className?: string;
  color?: string;
  glowColor?: string;
  width?: number;
  glowIntensity?: number;
  isDivider?: boolean;
}

export const LightningScrollEffect = ({
  className = "",
  color = "#00ffff",
  glowColor = "rgba(255, 255, 255, 0.8)",
  width = 5,
  glowIntensity = 0.8,
  isDivider = false
}: LightningScrollEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollPositionRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const handleResize = () => {
      if (isDivider) {
        canvas.width = 50; // Narrower width for divider
        canvas.height = window.innerHeight;
      } else {
        canvas.width = 150; // Original width for full-screen effect
        canvas.height = window.innerHeight;
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Handle scroll
    const handleScroll = () => {
      const scrollPercentage = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      scrollPositionRef.current = scrollPercentage;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Draw lightning bolt
    const drawLightningBolt = (timestamp: number) => {
      if (!ctx || !canvas) return;
      
      // Update time reference for animations
      timeRef.current = timestamp / 1000; // Convert to seconds
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const height = canvas.height;
      const centerX = canvas.width / 2;
      
      // Lightning bolt path points with slight randomness
      const jitter = Math.sin(timeRef.current * 2) * 2; // Subtle movement
      
      // Create a straighter path for divider mode
      let points;
      if (isDivider) {
        points = [
          { x: centerX, y: 0 },
          { x: centerX - 8 + jitter, y: height * 0.15 },
          { x: centerX + 5 - jitter, y: height * 0.3 },
          { x: centerX - 10 + jitter, y: height * 0.5 },
          { x: centerX + 8 - jitter, y: height * 0.7 },
          { x: centerX - 5 + jitter, y: height * 0.85 },
          { x: centerX, y: height }
        ];
      } else {
        points = [
          { x: centerX, y: 0 },
          { x: centerX - 25 + jitter, y: height * 0.15 },
          { x: centerX + 15 - jitter, y: height * 0.3 },
          { x: centerX - 30 + jitter, y: height * 0.5 },
          { x: centerX + 20 - jitter, y: height * 0.65 },
          { x: centerX - 15 + jitter, y: height * 0.85 },
          { x: centerX, y: height }
        ];
      }
      
      // Draw outer glow for the bolt
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.globalCompositeOperation = 'lighter';
      
      // Draw the main bolt with glow
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.lineWidth = width + 4;
      ctx.strokeStyle = color.replace('rgba', 'rgba').replace(')', ', 0.5)');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Reset shadow for clean drawing
      ctx.shadowBlur = 0;
      
      // Draw the main bolt
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Calculate glow position based on scroll
      const scrollPos = scrollPositionRef.current;
      const glowY = scrollPos * height;
      
      // Draw glow effect that follows scroll
      const glowRadius = isDivider ? 80 : 150;
      const gradient = ctx.createRadialGradient(
        centerX, glowY, 0,
        centerX, glowY, glowRadius
      );
      
      // Parse the glow color to create proper RGBA values
      const baseColor = glowColor.replace('rgba(', '').replace(')', '').split(',');
      const r = baseColor[0].trim();
      const g = baseColor[1].trim();
      const b = baseColor[2].trim();
      
      // Create pulsing effect
      const pulseIntensity = (Math.sin(timeRef.current * 3) * 0.2 + 0.8) * glowIntensity;
      
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${pulseIntensity * 0.8})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${pulseIntensity * 0.3})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - glowRadius, glowY - glowRadius, glowRadius * 2, glowRadius * 2);
      
      // Draw smaller glows along the path
      points.forEach((point, index) => {
        // Skip first and last points
        if (index === 0 || index === points.length - 1) return;
        
        // Distance from current scroll position determines brightness
        const distanceFromScroll = Math.abs(point.y - glowY) / height;
        const opacity = Math.max(0, 1 - distanceFromScroll * 2) * glowIntensity;
        
        const smallGlowGradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, isDivider ? 25 : 40
        );
        
        smallGlowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity * 0.7})`);
        smallGlowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = smallGlowGradient;
        ctx.fillRect(point.x - (isDivider ? 25 : 40), point.y - (isDivider ? 25 : 40), 
                    (isDivider ? 50 : 80), (isDivider ? 50 : 80));
      });
      
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
      
      // Add white core to the lightning
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.lineWidth = width / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      
      // Add small branches to make it more lightning-like
      // For divider mode, make fewer, smaller branches
      if (!isDivider) {
        ctx.lineWidth = width / 3;
        ctx.strokeStyle = color;
        
        // Add branches at certain points
        [1, 3, 5].forEach(i => {
          if (i < points.length - 1) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            
            // Branch out in a random direction
            const branchLength = 30 + Math.random() * 20;
            const angle = Math.random() * Math.PI;
            const endX = points[i].x + Math.cos(angle) * branchLength;
            const endY = points[i].y + Math.sin(angle) * branchLength;
            
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Add white core to branch
            ctx.lineWidth = width / 6;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
          }
        });
      } else {
        // Smaller branches for divider
        ctx.lineWidth = width / 4;
        ctx.strokeStyle = color;
        
        // Add fewer branches for divider
        [2, 4].forEach(i => {
          if (i < points.length - 1) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            
            // Branch out in a random direction, but smaller
            const branchLength = 15 + Math.random() * 10;
            const angle = Math.random() * Math.PI;
            const endX = points[i].x + Math.cos(angle) * branchLength;
            const endY = points[i].y + Math.sin(angle) * branchLength;
            
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Add white core to branch
            ctx.lineWidth = width / 8;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
          }
        });
      }
      
      animationFrameRef.current = requestAnimationFrame(drawLightningBolt);
    };
    
    animationFrameRef.current = requestAnimationFrame(drawLightningBolt);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [color, glowColor, width, glowIntensity, isDivider]);
  
  return (
    <canvas 
      ref={canvasRef}
      className={`${isDivider ? 'h-full w-full' : 'fixed top-0 h-full'} pointer-events-none z-10 ${className}`}
      style={isDivider ? {} : { width: '150px' }}
    />
  );
}; 
"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

export const TracingBeam = ({
  children,
  className,
  steps = [],
}: {
  children: React.ReactNode;
  className?: string;
  steps?: Array<{ title: string; completed?: boolean }>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);
  const [pathLength, setPathLength] = useState(0);

  const scrollProgress = useMotionValue(0);

  // Update SVG height
  useEffect(() => {
    const updateHeight = () => {
      const sidebar = document.querySelector('.sidebar-container') as HTMLElement;
      const height = sidebar?.offsetHeight ?? window.innerHeight - 56;
      setSvgHeight(height - 40);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Scroll tracking
  useEffect(() => {
    const scrollElement = document.querySelector(".content-scroll-container") as HTMLElement;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const progress = scrollTop / (scrollHeight - clientHeight);
      scrollProgress.set(isNaN(progress) ? 0 : progress);
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [scrollProgress]);

  // Enhanced zigzag path with smooth curves and dynamic flow
  const createZigzagPath = (height: number) => {
    const segments = 12;
    const amplitude = 20; // Reduced amplitude
    const baseX = 15; // Moved closer to center
    let path = `M ${baseX} 0`;
    
    for (let i = 1; i <= segments; i++) {
      const progress = i / segments;
      const y = height * progress;
      
      // Create organic zigzag with varying amplitude
      const zigzagOffset = Math.sin(progress * Math.PI * 6) * amplitude * (0.7 + Math.sin(progress * Math.PI * 2) * 0.3);
      const x = baseX + zigzagOffset;
      
      // Add smooth curves between points
      const prevProgress = (i - 1) / segments;
      const prevY = height * prevProgress;
      const prevZigzagOffset = Math.sin(prevProgress * Math.PI * 6) * amplitude * (0.7 + Math.sin(prevProgress * Math.PI * 2) * 0.3);
      const prevX = baseX + prevZigzagOffset;
      
      // Control points for smooth curves
      const cp1X = prevX + (x - prevX) * 0.3;
      const cp1Y = prevY + (y - prevY) * 0.3;
      const cp2X = prevX + (x - prevX) * 0.7;
      const cp2Y = prevY + (y - prevY) * 0.7;
      
      path += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x} ${y}`;
    }
    
    return path;
  };

  const zigzagPath = createZigzagPath(svgHeight);

  // Generate key points along the path for step positioning
  const generateKeyPoints = (height: number) => {
    const points = [];
    const segments = 12;
    const amplitude = 20; // Reduced amplitude
    const baseX = 15; // Moved closer to center
    
    for (let i = 0; i <= segments; i++) {
      const progress = i / segments;
      const y = height * progress;
      const zigzagOffset = Math.sin(progress * Math.PI * 6) * amplitude * (0.7 + Math.sin(progress * Math.PI * 2) * 0.3);
      const x = baseX + zigzagOffset;
      points.push({ x, y });
    }
    return points;
  };

  const keyPoints = generateKeyPoints(svgHeight);

  const stepPositions = steps.length > 0
    ? steps.map((_, index) => {
        const progress = index / Math.max(steps.length - 1, 1);
        const segIndex = Math.min(Math.floor(progress * (keyPoints.length - 1)), keyPoints.length - 2);
        const segProgress = (progress * (keyPoints.length - 1)) - segIndex;

        const start = keyPoints[segIndex];
        const end = keyPoints[segIndex + 1];

        const x = start.x + (end.x - start.x) * segProgress;
        const y = start.y + (end.y - start.y) * segProgress;
        return { x, y };
      })
    : [];

  // Get path length
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [svgHeight]);

  // Animate stroke offset with smoother easing
  const dashOffset = useSpring(
    useTransform(scrollProgress, [0, 1], [pathLength, 0]),
    { stiffness: 60, damping: 20 }
  );

  const gradientY = useSpring(
    useTransform(scrollProgress, [0, 1], [0, svgHeight]),
    { stiffness: 50, damping: 15 }
  );

  // Pulsing animation for active state
  const pulseScale = useSpring(1, { stiffness: 100, damping: 10 });

  useEffect(() => {
    const interval = setInterval(() => {
      pulseScale.set(1.05);
      setTimeout(() => pulseScale.set(1), 200);
    }, 2000);
    return () => clearInterval(interval);
  }, [pulseScale]);

  return (
    <motion.div ref={ref} className={cn("relative mx-auto h-full w-full", className)}>
      <div className="absolute top-0 -left-2 md:left-0 lg:left-1 h-full">
        <svg
          viewBox={`0 0 60 ${Math.max(svgHeight, 100)}`}
          width="60"
          height={Math.max(svgHeight, 100)}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Glow effect background */}
          <motion.path
            d={zigzagPath}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="6"
            fill="none"
            opacity="0.4"
            filter="url(#glow)"
          />

          {/* Background zigzag line */}
          <motion.path
            d={zigzagPath}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Animated progress line with gradient */}
          <motion.path
            d={zigzagPath}
            stroke="url(#progressGradient)"
            strokeWidth="2"
            strokeDasharray={`${pathLength * 0.02} ${pathLength * 0.01}`}
            strokeDashoffset={dashOffset}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            ref={pathRef}
            style={{ filter: "drop-shadow(0 0 3px rgba(255, 255, 255, 0.4))" }}
          />

          {/* Floating particles along the path */}
          {[...Array(3)].map((_, i) => (
            <motion.circle
              key={`particle-${i}`}
              r="1"
              fill="rgba(255, 255, 255, 0.8)"
              animate={{
                offsetDistance: ["0%", "100%"],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 1.6,
              }}
              style={{
                offsetPath: `path('${zigzagPath}')`,
                filter: "drop-shadow(0 0 2px rgba(255, 255, 255, 0.6))",
              }}
            />
          ))}

          {/* Enhanced step circles with Clerk-style design */}
          {stepPositions.map((pos, i) => {
            const isCompleted = steps[i]?.completed ?? false;
            const currentProgress = scrollProgress.get();
            const stepProgress = i / Math.max(steps.length - 1, 1);
            const isActive = currentProgress >= stepProgress;
            const isPassing = currentProgress > stepProgress + 0.1;

            return (
              <g key={i}>
                {/* Outer glow ring */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="10"
                  fill="none"
                  stroke={isActive ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.08)"}
                  strokeWidth="1"
                  opacity={isActive ? 1 : 0.5}
                  animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                />
                
                {/* Main circle */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="6"
                  fill={
                    isCompleted 
                      ? "rgba(255, 255, 255, 0.9)" 
                      : isActive 
                        ? "rgba(255, 255, 255, 0.8)" 
                        : "rgba(255, 255, 255, 0.3)"
                  }
                  stroke={
                    isCompleted 
                      ? "rgba(255, 255, 255, 1)" 
                      : isActive 
                        ? "rgba(255, 255, 255, 0.9)" 
                        : "rgba(255, 255, 255, 0.4)"
                  }
                  strokeWidth="1"
                  style={{
                    filter: isActive 
                      ? "drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))" 
                      : "none"
                  }}
                  animate={{ 
                    scale: isActive ? pulseScale.get() : 1,
                  }}
                />

                {/* Inner dot */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="2"
                  fill={
                    isCompleted 
                      ? "rgba(0, 0, 0, 0.8)" 
                      : isActive 
                        ? "rgba(0, 0, 0, 0.6)" 
                        : "rgba(255, 255, 255, 0.8)"
                  }
                  animate={{ 
                    opacity: isActive ? [0.6, 1, 0.6] : 0.8 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: isActive ? Infinity : 0 
                  }}
                />

                {/* Checkmark for completed steps */}
                {isCompleted && (
                  <motion.path
                    d="M 10 14 L 13 17 L 18 12"
                    transform={`translate(${pos.x - 15}, ${pos.y - 15}) scale(0.4)`}
                    stroke="rgba(0, 0, 0, 0.8)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                )}

                {/* Progress indicator */}
                {isActive && !isCompleted && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r="5"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="15.71"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </g>
            );
          })}

          {/* Gradient definitions */}
          <defs>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Progress gradient */}
            <motion.linearGradient
              id="progressGradient"
              x1="0"
              x2="0"
              y1="0"
              y2={gradientY}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.3" />
            </motion.linearGradient>

            {/* Glow gradient */}
            <linearGradient id="glowGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
};
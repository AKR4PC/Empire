import React, { useEffect, useRef } from 'react';

interface SpaceTimeParticlesProps {
  count?: number;
  speed?: number;
  color?: string;
}

export const SpaceTimeParticles: React.FC<SpaceTimeParticlesProps> = ({
  count = 100,
  speed = 0.5,
  color = 'rgba(255, 255, 255, 0.7)'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const animationRef = useRef<number>(0);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Create particles with varied properties
    const createParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        // Create different types of particles
        const particleType = Math.random() > 0.7 ? 'star' : 'dot';
        const baseSize = particleType === 'star' ? 2 : 1;
        
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: (Math.random() * baseSize) + 0.5,
          speedX: (Math.random() - 0.5) * speed * (1 + Math.random()),
          speedY: (Math.random() - 0.5) * speed * (1 + Math.random()),
          opacity: Math.random() * 0.7 + 0.3,
          type: particleType,
          pulse: Math.random() * 0.02 + 0.01,
          pulseDirection: 1,
          trail: particleType === 'star' && Math.random() > 0.7,
          trailLength: Math.floor(Math.random() * 5) + 3
        });
      }
    };

    createParticles();

    // Animation loop with enhanced effects
    const animate = () => {
      // Use semi-transparent clear for motion trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Calculate distance from mouse for interactive effect
        const dx = mousePositionRef.current.x - particle.x;
        const dy = mousePositionRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;
        
        if (distance < maxDistance) {
          // Particles are repelled from mouse
          const angle = Math.atan2(dy, dx);
          const force = (maxDistance - distance) / maxDistance;
          particle.speedX -= Math.cos(angle) * force * 0.02;
          particle.speedY -= Math.sin(angle) * force * 0.02;
          
          // Limit max speed
          const currentSpeed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
          if (currentSpeed > speed * 2) {
            particle.speedX = (particle.speedX / currentSpeed) * speed * 2;
            particle.speedY = (particle.speedY / currentSpeed) * speed * 2;
          }
        }
        
        // Pulsing size effect
        particle.radius += particle.pulse * particle.pulseDirection;
        if (particle.radius > (particle.type === 'star' ? 2.5 : 1.5) || 
            particle.radius < (particle.type === 'star' ? 1.5 : 0.5)) {
          particle.pulseDirection *= -1;
        }
        
        // Draw particle
        if (particle.type === 'star') {
          // Draw star
          drawStar(ctx, particle.x, particle.y, particle.radius * 2, particle.opacity);
        } else {
          // Draw regular dot
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(')', `, ${particle.opacity})`);
          ctx.fill();
          
          // Add glow effect for some particles
          if (particle.radius > 1) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
            ctx.fillStyle = color.replace(')', `, ${particle.opacity * 0.2})`);
            ctx.fill();
          }
        }
        
        // Draw trail for some particles
        if (particle.trail) {
          const trailOpacity = particle.opacity * 0.4;
          for (let i = 1; i <= particle.trailLength; i++) {
            const trailX = particle.x - (particle.speedX * i * 2);
            const trailY = particle.y - (particle.speedY * i * 2);
            const size = particle.radius * (1 - i / (particle.trailLength * 1.5));
            
            if (size > 0) {
              ctx.beginPath();
              ctx.arc(trailX, trailY, size, 0, Math.PI * 2);
              ctx.fillStyle = color.replace(')', `, ${trailOpacity * (1 - i/particle.trailLength)})`);
              ctx.fill();
            }
          }
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Helper function to draw star shape
    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, opacity: number) => {
      const spikes = 5;
      const outerRadius = radius;
      const innerRadius = radius * 0.4;
      
      let rot = Math.PI / 2 * 3;
      let step = Math.PI / spikes;
      
      ctx.beginPath();
      ctx.moveTo(x, y - outerRadius);
      
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(
          x + Math.cos(rot) * outerRadius,
          y + Math.sin(rot) * outerRadius
        );
        rot += step;
        
        ctx.lineTo(
          x + Math.cos(rot) * innerRadius,
          y + Math.sin(rot) * innerRadius
        );
        rot += step;
      }
      
      ctx.lineTo(x, y - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color.replace(')', `, ${opacity})`);
      ctx.fill();
      
      // Add subtle glow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 5;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [count, speed, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6, mixBlendMode: 'screen' }}
    />
  );
}; 
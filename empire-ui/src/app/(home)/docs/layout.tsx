"use client";

import { docsConfig } from "@/config/docs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeProvider } from "@/components/core/providers";
import { DocsSidebarNav } from "@/components/sidebar-nav";
import { Navbar } from "@/components/common/navbar";
import { SpaceTimeParticles } from "@/components/common/space-time-particles";
import { NeonDotGrid } from "@/components/ui/neon-dot-grid";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { useEffect, useState, useRef } from "react";
import { MinecartLCD } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const flickeringLightRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      
      if (flickeringLightRef.current) {
        // Calculate the position of the light based on scroll
        const scrollPercentage = (position / (document.body.scrollHeight - window.innerHeight)) * 100;
        flickeringLightRef.current.style.setProperty('--scroll-position', `${scrollPercentage}%`);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial position
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Track mouse position for hover effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        scrollContainerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <main className={cn("industrial-layout mt-0 pt-0", MinecartLCD.className)} style={{ marginTop: '-15px' }}>
        <Navbar />
        <div className="w-[1450px] max-w-[95%] mx-auto mt-2">
          <div 
            className="docs-space-time-background relative rounded-lg overflow-hidden border border-zinc-800 shadow-[0_0_35px_rgba(255,255,255,0.05)]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            ref={scrollContainerRef}
          >
            <NeonDotGrid 
              dotColor="rgba(255, 255, 255, 0.2)"
              dotSize={1.2}
              dotSpacing={30}
              glowColor="rgba(255, 255, 255, 0.8)"
              glowIntensity={0.8}
            />
            {isHovering && <SpaceTimeParticles count={100} speed={0.3} color="rgba(255, 255, 255, 0.7)" />}
            
            {/* Header with dotted line - enhanced for black/white theme */}
            <div className="relative z-10 flex justify-end items-start p-6 border-b border-zinc-800">
              <div className="text-right">
                <h1 className="text-white text-3xl font-bold leading-tight mb-2 tracking-tighter">
                  Documentation
                </h1>
                <div className="flex items-center justify-end gap-6">
                  <div className="h-px w-64" style={{ 
                    backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', 
                    backgroundSize: '8px 3px',
                    backgroundRepeat: 'repeat-x',
                    height: '3px',
                    filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))'
                  }}></div>
                  <p className="text-gray-300 text-sm">
                    Empire UI Reference
                  </p>
                </div>
              </div>
            </div>
            
            <div className="premium-docs-container">
              <div className="flex-1 items-start bg-[#0a0a0a] px-6 sm:px-12 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20 relative min-h-screen">
                <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block sidebar-container">
                  <div className="flickering-light absolute top-0 left-0 w-full h-full pointer-events-none" 
                       style={{
                         background: 'radial-gradient(circle at var(--scroll-position, 0%) 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                         opacity: '0.7',
                         mixBlendMode: 'screen'
                       }} 
                       ref={flickeringLightRef}></div>
                  <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                    <DocsSidebarNav items={docsConfig.sidebarNav} />
                  </ScrollArea>
                </aside>
                <TracingBeam className="z-10 pl-8 md:pl-20 lg:pl-20 min-h-screen">
                  <div className="h-[calc(100vh-3.5rem)] overflow-y-auto content-scroll-container custom-scrollbar">
                    <main className={cn("prose prose-zinc min-w-0 max-w-full flex-1 pb-16 pt-8 text-white prose-h1:text-white prose-h2:text-white prose-h3:text-white prose-strong:text-white prose-a:text-white prose-h1:text-2xl prose-h1:font-semibold prose-h2:text-xl prose-h2:font-medium prose-h3:text-base prose-h3:font-medium prose-strong:font-medium prose-table:block prose-table:overflow-y-auto lg:max-w-2xl lg:pt-12", MinecartLCD.className)}>
                      {children}
                    </main>
                  </div>
                </TracingBeam>
              </div>
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        .docs-space-time-background {
          background: linear-gradient(to bottom, #0a0a0a, #121212);
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.03);
        }
        .flickering-light {
          animation: flicker 8s infinite alternate;
        }
        @keyframes flicker {
          0%, 100% { opacity: 0.7; }
          25% { opacity: 0.5; }
          50% { opacity: 0.8; }
          75% { opacity: 0.6; }
        }
      `}</style>
    </ThemeProvider>
  );
}

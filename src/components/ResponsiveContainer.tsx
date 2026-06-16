/**
 * Responsive Container Component
 * Provides responsive breakpoints and viewport utilities
 */
import { useEffect, useState } from 'preact/hooks';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ResponsiveContainerProps {
  children: preact.ComponentChild;
  className?: string;
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('md');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`responsive-container responsive-${breakpoint} ${className}`}>
      {children}
    </div>
  );
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('md');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);

  return matches;
}

import { useState } from 'preact/hooks';

interface TooltipProps {
  children: preact.ComponentChild;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  
  return (
    <span 
      style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          padding: '8px 12px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          fontSize: 11,
          borderRadius: 8,
          maxWidth: 250,
          width: 'max-content',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {content}
        </div>
      )}
    </span>
  );
}

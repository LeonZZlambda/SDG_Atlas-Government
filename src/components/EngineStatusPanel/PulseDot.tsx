interface PulseDotProps {
  status: 'active' | 'idle' | 'computing';
}

export function PulseDot({ status }: PulseDotProps) {
  const dotColor = status === 'active' ? '#10b981'
                 : status === 'computing' ? '#f59e0b'
                 : '#94a3b8';

  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
      {status !== 'idle' && (
        <span style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: dotColor,
          opacity: 0.4,
          animation: 'engine-ping 1.4s ease-in-out infinite',
        }} />
      )}
      <span style={{
        position: 'relative',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: dotColor,
      }} />
    </span>
  );
}

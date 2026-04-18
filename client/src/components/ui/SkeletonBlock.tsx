interface Props {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonBlock({ width = '100%', height = '1rem', className = '' }: Props) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: 'var(--surface-2)',
        borderRadius: 2,
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

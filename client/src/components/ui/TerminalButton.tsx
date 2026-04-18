import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
}

export function TerminalButton({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...rest
}: Props) {
  const isPrimary = variant === 'primary';
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '12px 24px',
        width: fullWidth ? '100%' : undefined,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s',
        opacity: disabled || loading ? 0.6 : 1,
        border: isPrimary ? 'none' : '1px solid var(--border)',
        background: isPrimary ? 'var(--positive)' : 'transparent',
        color: isPrimary ? '#000' : 'var(--text)',
        fontWeight: isPrimary ? 700 : 400,
        borderRadius: 0,
        ...style,
      }}
    >
      {loading ? '...' : children}
    </button>
  );
}

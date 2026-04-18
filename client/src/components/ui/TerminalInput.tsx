import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export function TerminalInput({ label, error, ...rest }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text)',
      }}>
        {label}
      </label>
      <input
        {...rest}
        style={{
          background: 'var(--surface)',
          border: `1px solid ${error ? 'var(--negative)' : 'var(--border)'}`,
          color: 'var(--title)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          padding: '10px 12px',
          borderRadius: 0,
          outline: 'none',
          width: '100%',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--positive)';
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--border)';
          rest.onBlur?.(e);
        }}
      />
      {error && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--negative)',
        }}>
          {error}
        </span>
      )}
    </div>
  );
}

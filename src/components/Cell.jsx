import React, { useMemo } from 'react';

export default function Cell({ value, index, onClick, isWinning, currentTurn, disabled }) {
  const hint = !value && !disabled ? currentTurn : null;

  const symbol = useMemo(() => {
    if (value === 'X') return '✕';
    if (value === 'O') return '◯';
    return null;
  }, [value]);

  return (
    <button
      id={`cell-${index}`}
      className={[
        'cell',
        value === 'X' ? 'x' : '',
        value === 'O' ? 'o' : '',
        isWinning ? 'winning-cell' : '',
        disabled && !value ? 'disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label={`Cell ${index + 1}${value ? `, ${value}` : ''}`}
      disabled={!!value || disabled}
    >
      {symbol && (
        <span className="cell-symbol" key={value + index}>
          {symbol}
        </span>
      )}
      {hint && (
        <span className={`cell-hint hint-${hint.toLowerCase()}`}>
          {hint === 'X' ? '✕' : '◯'}
        </span>
      )}
    </button>
  );
}

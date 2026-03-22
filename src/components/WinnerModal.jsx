import React from 'react';
import Confetti from './Confetti';

export default function WinnerModal({ winner, onPlayAgain, onReset, mode }) {
  const isX = winner === 'X';
  const isDraw = winner === 'draw';
  const isAiWin = mode === 'ai' && winner === 'O';
  const isPlayerWin = mode === 'ai' && winner === 'X';

  const emoji = isDraw ? '🤝' : isAiWin ? '🤖' : isPlayerWin ? '🎉' : isX ? '🎉' : '🎉';
  const title = isDraw
    ? "It's a Draw!"
    : isAiWin
    ? 'AI Wins!'
    : isPlayerWin
    ? 'You Win!'
    : `Player ${winner} Wins!`;
  const subtitle = isDraw
    ? 'A perfect match — no one takes the crown today.'
    : isAiWin
    ? 'The machine prevails. Try again!'
    : 'Excellent play! The board is yours.';

  return (
    <>
      {!isDraw && <Confetti />}
      <div className="winner-overlay" role="dialog" aria-modal="true" aria-label={title}>
        <div className="winner-card">
          <span className="winner-emoji">{emoji}</span>
          <h2
            className={[
              'winner-title',
              isX ? 'x-win' : isDraw ? 'draw' : 'o-win',
            ].join(' ')}
          >
            {title}
          </h2>
          <p className="winner-subtitle">{subtitle}</p>
          <div className="winner-actions">
            <button id="btn-play-again" className="btn btn-primary" onClick={onPlayAgain}>
              🔄 Play Again
            </button>
            <button id="btn-reset-scores" className="btn btn-secondary" onClick={onReset}>
              ↺ Reset All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

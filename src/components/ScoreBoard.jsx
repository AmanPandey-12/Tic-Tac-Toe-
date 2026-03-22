import React from 'react';

export default function ScoreBoard({ scores, currentTurn, gameOver, mode }) {
  return (
    <div className="scoreboard">
      <div
        className={[
          'score-card x-card',
          currentTurn === 'X' && !gameOver ? 'active-player' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="score-label">Player</div>
        <div className="score-player">✕ {mode === 'ai' ? 'You' : 'X'}</div>
        <div className="score-value">{scores.X}</div>
      </div>

      <div className="score-card draw-card">
        <div className="score-label">Draws</div>
        <div className="score-player">⚡ Ties</div>
        <div className="score-value">{scores.draw}</div>
      </div>

      <div
        className={[
          'score-card o-card',
          currentTurn === 'O' && !gameOver ? 'active-player' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="score-label">{mode === 'ai' ? 'AI' : 'Player'}</div>
        <div className="score-player">◯ {mode === 'ai' ? 'AI' : 'O'}</div>
        <div className="score-value">{scores.O}</div>
      </div>
    </div>
  );
}

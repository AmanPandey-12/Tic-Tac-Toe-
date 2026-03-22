import React from 'react';
import Cell from './Cell';

export default function Board({ board, onCellClick, winningCombo, currentTurn, disabled }) {
  return (
    <div className="board-wrapper">
      <div className="board" role="grid" aria-label="Tic-Tac-Toe board">
        {board.map((value, index) => (
          <Cell
            key={index}
            index={index}
            value={value}
            onClick={() => onCellClick(index)}
            isWinning={winningCombo?.includes(index)}
            currentTurn={currentTurn}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

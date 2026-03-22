import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import Board from './components/Board';
import ScoreBoard from './components/ScoreBoard';
import WinnerModal from './components/WinnerModal';
import { checkWinner, isBoardFull, getBestMove } from './gameLogic';

const initialBoard = Array(9).fill(null);

const CELL_LABELS = [
  'A1', 'A2', 'A3',
  'B1', 'B2', 'B3',
  'C1', 'C2', 'C3',
];

export default function App() {
  const [board, setBoard] = useState([...initialBoard]);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [winResult, setWinResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('vs'); // 'vs' | 'ai'
  const [difficulty, setDifficulty] = useState('hard');
  const [moveLog, setMoveLog] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);

  // Ref to cancel any pending AI timer on reset
  const aiTimerRef = useRef(null);
  // Always tracks the latest difficulty so the AI closure never goes stale
  const difficultyRef = useRef(difficulty);
  const aiCancelledRef = useRef(false);

  // ──────── Win / Draw detection ────────
  const evaluateBoard = useCallback((nextBoard) => {
    const result = checkWinner(nextBoard);
    if (result) {
      setWinResult(result);
      setGameOver(true);
      setScores((s) => ({ ...s, [result.winner]: s[result.winner] + 1 }));
      setTimeout(() => setShowModal(true), 600);
      return true;
    }
    if (isBoardFull(nextBoard)) {
      setWinResult({ winner: 'draw', combo: [] });
      setGameOver(true);
      setScores((s) => ({ ...s, draw: s.draw + 1 }));
      setTimeout(() => setShowModal(true), 600);
      return true;
    }
    return false;
  }, []);

  // ──────── AI Move ────────
  useEffect(() => {
    if (mode !== 'ai' || currentTurn !== 'O' || gameOver) return;

    // Cancel any previous pending move
    aiCancelledRef.current = false;
    setAiThinking(true);
    const currentDifficulty = difficultyRef.current;
    const delay = currentDifficulty === 'easy' ? 400 : currentDifficulty === 'medium' ? 600 : 750;

    aiTimerRef.current = setTimeout(() => {
      if (aiCancelledRef.current) return;

      setBoard((prev) => {
        if (aiCancelledRef.current) return prev;
        const copy = [...prev];
        const idx = getBestMove([...copy], currentDifficulty);
        if (idx === null || copy[idx] !== null) {
          setAiThinking(false);
          return prev;
        }
        copy[idx] = 'O';
        return copy;
      });

      // Run post-move updates in next tick so setBoard has committed
      setTimeout(() => {
        if (aiCancelledRef.current) return;
        setBoard((latestBoard) => {
          setMoveLog((log) => {
            // figure out which cell was just played (last O placed)
            const idx = latestBoard.findIndex(
              (v, i) => v === 'O' && !log.some((m) => m.cell === CELL_LABELS[i] && m.player === 'O')
            );
            if (idx !== -1) {
              return [...log, { player: 'O', cell: CELL_LABELS[idx] }];
            }
            return log;
          });
          const ended = evaluateBoard(latestBoard);
          if (!ended) setCurrentTurn('X');
          setAiThinking(false);
          return latestBoard;
        });
      }, 0);
    }, delay);

    return () => {
      aiCancelledRef.current = true;
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, mode, gameOver]);

  // ──────── Cell Click ────────
  const handleCellClick = useCallback(
    (index) => {
      if (board[index] || gameOver || aiThinking || (mode === 'ai' && currentTurn === 'O')) return;

      const nextBoard = [...board];
      nextBoard[index] = currentTurn;
      setBoard(nextBoard);
      setMoveLog((log) => [...log, { player: currentTurn, cell: CELL_LABELS[index] }]);

      const ended = evaluateBoard(nextBoard);
      if (!ended) {
        setCurrentTurn((t) => (t === 'X' ? 'O' : 'X'));
      }
    },
    [board, gameOver, currentTurn, mode, aiThinking, evaluateBoard],
  );

  // ──────── Reset helpers ────────
  const cancelAI = () => {
    aiCancelledRef.current = true;
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    aiTimerRef.current = null;
  };

  const resetRound = useCallback(() => {
    cancelAI();
    setBoard([...initialBoard]);
    setCurrentTurn('X');
    setWinResult(null);
    setGameOver(false);
    setShowModal(false);
    setMoveLog([]);
    setAiThinking(false);
    // Allow future AI moves
    setTimeout(() => { aiCancelledRef.current = false; }, 0);
  }, []);

  const resetAll = useCallback(() => {
    cancelAI();
    setBoard([...initialBoard]);
    setCurrentTurn('X');
    setWinResult(null);
    setGameOver(false);
    setShowModal(false);
    setMoveLog([]);
    setAiThinking(false);
    setScores({ X: 0, O: 0, draw: 0 });
    setTimeout(() => { aiCancelledRef.current = false; }, 0);
  }, []);

  // ──────── Mode change ────────
  const handleModeChange = (newMode) => {
    cancelAI();
    setMode(newMode);
    setBoard([...initialBoard]);
    setCurrentTurn('X');
    setWinResult(null);
    setGameOver(false);
    setShowModal(false);
    setMoveLog([]);
    setAiThinking(false);
    setScores({ X: 0, O: 0, draw: 0 });
    setTimeout(() => { aiCancelledRef.current = false; }, 0);
  };

  // ──────── Difficulty change ────────
  const handleDifficultyChange = (d) => {
    if (d === difficulty) return;
    difficultyRef.current = d;
    cancelAI();
    setDifficulty(d);
    setBoard([...initialBoard]);
    setCurrentTurn('X');
    setWinResult(null);
    setGameOver(false);
    setShowModal(false);
    setMoveLog([]);
    setAiThinking(false);
    setTimeout(() => { aiCancelledRef.current = false; }, 0);
  };

  // ──────── Status text ────────
  const getStatus = () => {
    if (aiThinking) return { icon: '🤖', text: 'AI is thinking…' };
    if (gameOver && winResult) {
      if (winResult.winner === 'draw') return { icon: '🤝', text: "It's a Draw!" };
      if (mode === 'ai') {
        return winResult.winner === 'X'
          ? { icon: '🎉', text: 'You win this round!' }
          : { icon: '🤖', text: 'AI wins this round!' };
      }
      return { icon: '🏆', text: `Player ${winResult.winner} wins!` };
    }
    if (mode === 'ai' && currentTurn === 'X') return { icon: '👆', text: 'Your turn — make a move!' };
    if (mode === 'ai' && currentTurn === 'O') return { icon: '⏳', text: 'AI is about to move…' };
    return { icon: currentTurn === 'X' ? '✕' : '◯', text: `Player ${currentTurn}'s turn` };
  };

  const status = getStatus();

  return (
    <>
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <main className="app">
        {/* ── Header ── */}
        <header className="header">
          <div className="header-logo">
            <span className="logo-icon">⚡</span>
            <h1>Tic-Tac-Toe</h1>
          </div>
          <p>Ultimate Edition · HTML × CSS × React</p>
        </header>

        {/* ── Mode Selector ── */}
        <div className="mode-selector" role="group" aria-label="Game mode">
          <button
            id="btn-mode-vs"
            className={`mode-btn ${mode === 'vs' ? 'active' : ''}`}
            onClick={() => handleModeChange('vs')}
          >
            👥 2 Players
          </button>
          <button
            id="btn-mode-ai"
            className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
            onClick={() => handleModeChange('ai')}
          >
            🤖 vs AI
          </button>
        </div>

        {/* ── Difficulty (AI mode only) ── */}
        {mode === 'ai' && (
          <div className="difficulty-row">
            <span className="difficulty-label">Difficulty</span>
            <div className="difficulty-options" role="group" aria-label="AI difficulty">
              {['easy', 'medium', 'hard'].map((d) => (
                <button
                  key={d}
                  id={`btn-diff-${d}`}
                  className={`diff-btn ${d} ${difficulty === d ? 'active' : ''}`}
                  onClick={() => handleDifficultyChange(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ScoreBoard ── */}
        <ScoreBoard
          scores={scores}
          currentTurn={currentTurn}
          gameOver={gameOver}
          mode={mode}
        />

        {/* ── Status ── */}
        <div className={`status-bar ${gameOver ? 'show-bar' : ''}`} role="status" aria-live="polite">
          <span className="status-icon">{status.icon}</span>
          {status.text}
        </div>

        {/* ── Game Board ── */}
        <Board
          board={board}
          onCellClick={handleCellClick}
          winningCombo={winResult?.combo}
          currentTurn={currentTurn}
          disabled={gameOver || aiThinking}
        />

        {/* ── Action Buttons ── */}
        <div className="actions">
          <button id="btn-new-round" className="action-btn reset" onClick={resetRound}>
            🔄 New Round
          </button>
          <button id="btn-reset-all" className="action-btn clear" onClick={resetAll}>
            🗑 Reset All
          </button>
        </div>

        {/* ── Move Log ── */}
        {moveLog.length > 0 && (
          <div className="move-log" aria-label="Move history">
            <div className="move-log-header">Move History</div>
            <div className="move-log-list">
              {moveLog.map((m, i) => (
                <span key={i} className={`move-chip ${m.player.toLowerCase()}`}>
                  {m.player === 'X' ? '✕' : '◯'} {m.cell}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Winner Modal ── */}
      {showModal && winResult && (
        <WinnerModal
          winner={winResult.winner}
          onPlayAgain={resetRound}
          onReset={resetAll}
          mode={mode}
        />
      )}
    </>
  );
}

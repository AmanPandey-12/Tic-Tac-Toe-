// ============================================================
// AI LOGIC — Minimax with alpha-beta pruning for "hard" mode
// ============================================================

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

export function checkWinner(board) {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo: [a, b, c] };
    }
  }
  return null;
}

export function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

function scoreBoard(board, depth) {
  const result = checkWinner(board);
  if (result?.winner === 'O') return 10 - depth;
  if (result?.winner === 'X') return depth - 10;
  return 0;
}

function minimax(board, depth, isMaximizing, alpha, beta, maxDepth) {
  const score = scoreBoard(board, depth);
  if (score !== 0 || isBoardFull(board) || depth === maxDepth) {
    return score;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false, alpha, beta, maxDepth));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true, alpha, beta, maxDepth));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

export function getBestMove(board, difficulty) {
  const empty = board.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
  if (empty.length === 0) return null;

  // Easy: random move
  if (difficulty === 'easy') {
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Medium: 60% random, 40% smart
  if (difficulty === 'medium') {
    if (Math.random() < 0.5) {
      return empty[Math.floor(Math.random() * empty.length)];
    }
  }

  // Hard / Medium-smart: full minimax
  const maxDepth = difficulty === 'hard' ? 9 : 4;
  let bestScore = -Infinity;
  let bestMove = empty[0];

  for (const i of empty) {
    board[i] = 'O';
    const score = minimax(board, 0, false, -Infinity, Infinity, maxDepth);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
}

export { WINNING_COMBOS };

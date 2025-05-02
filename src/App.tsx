import React, { useState, useRef, useEffect } from 'react';
import { TicTacToeAgent, BoardState } from './ai/agent';
import { Button } from '@/components/ui/button';

const agent = new TicTacToeAgent();
const initialBoard: BoardState = Array(9).fill(0);

function checkWinner(board: BoardState): number | null {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of wins) {
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return board.includes(0) ? null : 0;
}

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>([...initialBoard]);
  const [message, setMessage] = useState('Your turn (X)');
  const [gameOver, setGameOver] = useState(false);
  const [count, setCount] = useState(0);

  // refs to track last AI move for loss training
  const lastStateRef = useRef<BoardState | null>(null);
  const lastActionRef = useRef<number | null>(null);

  useEffect(() => {
    setCount(agent.gameCount);
  }, []);

  const makeMove = async (index: number) => {
    if (board[index] !== 0 || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = 1;
    let winner = checkWinner(newBoard);
    if (winner !== null) return handleEnd(winner, newBoard);

    const stateBeforeAI = [...newBoard];
    const aiAction = await agent.chooseAction(newBoard);
    lastStateRef.current = stateBeforeAI;
    lastActionRef.current = aiAction;

    const nextBoard = [...newBoard];
    nextBoard[aiAction] = -1;
    winner = checkWinner(nextBoard);

    await agent.observe({ state: stateBeforeAI, action: aiAction,
      reward: winner === -1 ? 1 : winner === 0 ? 0.5 : 0,
      nextState: nextBoard, done: winner !== null });

    if (winner !== null) return handleEnd(winner, nextBoard);

    setBoard(nextBoard);
  };

  const handleEnd = async (winner: number, finalBoard: BoardState) => {
    setBoard(finalBoard);
    setGameOver(true);
    setMessage(
      winner === 1 ? 'You win!' : winner === -1 ? 'AI wins!' : "It's a tie"
    );

    // Train on loss if player won
    if (winner === 1 && lastStateRef.current != null && lastActionRef.current != null) {
      await agent.observe({
        state: lastStateRef.current, action: lastActionRef.current,
        reward: -1, nextState: finalBoard, done: true,
      });
    }

    setCount(agent.gameCount);
  };

  const resetBoard = () => {
    setBoard([...initialBoard]);
    setGameOver(false);
    setMessage('Your turn (X)');
    lastStateRef.current = null;
    lastActionRef.current = null;
  };

  const resetAI = () => {
    agent.reset();
    resetBoard();
    setCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-bold">Tic Tac Toe with Learning AI</h1>
      <p>Games learned: {count}</p>
      <div className="grid grid-cols-3 gap-1 w-48">
        {board.map((val, i) => (
          <button
            key={i}
            className="aspect-square w-full text-xl font-bold border bg-white hover:bg-gray-200"
            onClick={() => makeMove(i)}
            disabled={val !== 0 || gameOver}
          >
            {val === 1 ? 'X' : val === -1 ? 'O' : ''}
          </button>
        ))}
      </div>
      <p className="text-lg font-medium">{message}</p>
      <div className="flex space-x-2">
        <Button onClick={resetBoard}>Play Again</Button>
        <Button variant="destructive" onClick={resetAI}>Reset AI</Button>
      </div>
    </div>
  );
};

export default App;

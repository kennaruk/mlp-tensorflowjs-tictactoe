import { Square } from "./square"

interface BoardProps {
  xIsNext: boolean
  squares: (string | null)[]
  onPlay: (squares: (string | null)[]) => void
}

export default function Board({ xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return
    }
    const nextSquares = squares.slice()
    if (xIsNext) {
      nextSquares[i] = "X"
    } else {
      nextSquares[i] = "O"
    }
    onPlay(nextSquares)
  }

  const winner = calculateWinner(squares)
  let status
  if (winner) {
    status = `Winner: ${winner}`
  } else if (squares.every((square) => square !== null)) {
    status = "Draw!"
  } else {
    status = `Next player: ${xIsNext ? "X" : "O"}`
  }

  return (
    <div>
      <div className="mb-4 text-lg font-medium px-2 py-1 rounded bg-slate-100 text-slate-800">{status}</div>
      <div className="grid grid-cols-3 gap-2 max-w-[300px]">
        {Array(9)
          .fill(null)
          .map((_, i) => (
            <Square
              key={i}
              value={squares[i]}
              onSquareClick={() => handleClick(i)}
              highlight={winner && winningLine(squares)?.includes(i) || false}
            />
          ))}
      </div>
    </div>
  )
}

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}

function winningLine(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i]
    }
  }
  return null
}

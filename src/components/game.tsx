"use client"

import { useState } from "react"
import Board from "./board"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState(0)
  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  console.log('[debug] currentSquares', currentSquares)

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove)
  }

  const moves = history.map((_squares, move) => {
    let description
    if (move > 0) {
      description = `Go to move #${move}`
    } else {
      description = "Go to game start"
    }
    return (
      <li key={move} className="mb-2">
        <Button variant={move === currentMove ? "default" : "outline"} size="sm" onClick={() => jumpTo(move)}>
          {description}
        </Button>
      </li>
    )
  })

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 bg-white rounded-xl shadow-lg w-full h-full">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Tic Tac Toe</h1>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="flex-1 mt-6 md:mt-0">
        <h2 className="text-lg font-semibold mb-3 text-slate-700">Game History</h2>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <ol>{moves}</ol>
        </ScrollArea>
      </div>
    </div>
  )
}

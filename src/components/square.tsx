"use client"

import { cn } from "@/lib/utils"

interface SquareProps {
  value: string | null
  onSquareClick: () => void
  highlight?: boolean
}

export function Square({ value, onSquareClick, highlight }: SquareProps) {
  return (
    <button
      className={cn(
        "h-24 w-24 border-2 border-slate-300 text-4xl font-bold flex items-center justify-center transition-all",
        "hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        highlight && "bg-green-100 border-green-400",
        value === "X" ? "text-blue-600" : "text-rose-600",
      )}
      onClick={onSquareClick}
    >
      {value}
    </button>
  )
}

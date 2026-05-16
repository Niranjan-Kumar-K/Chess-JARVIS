import React, { useState } from "react";
import ChessBoard from "./components/ChessBoard";
import useStockfish from "./hooks/useStockfish";
import { Layers, Terminal as TermIcon, Cpu, TrendingUp } from "lucide-react";

export default function App() {
  const [currentFen, setCurrentFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const { evaluation, bestLine, isThinking } = useStockfish(currentFen);

  const handleMove = (newFen) => {
    setCurrentFen(newFen);
  };

  // Convert scores into visual height constraints (Clamped between -5.00 and +5.00 pawns)
  const getEvalPercentage = () => {
    if (evaluation.toString().startsWith("M")) {
      return evaluation.includes("-") ? 0 : 100;
    }
    const score = parseFloat(evaluation);
    if (isNaN(score)) return 50;
    const clampedScore = Math.max(-5, Math.min(5, score));
    return ((clampedScore + 5) / 10) * 100;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      {/* Navigation Header Panel */}
      <header className="w-full max-w-6xl mb-8 flex justify-between items-center p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Layers size={22} />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white">
            JARVIS{" "}
            <span className="text-blue-400 text-sm font-medium">CHESS</span>
          </h1>
        </div>
        <div
          className={`flex items-center gap-2 text-sm transition-all duration-300 ${isThinking ? "text-amber-400 animate-pulse" : "text-gray-400"}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isThinking ? "bg-amber-400" : "bg-emerald-500"}`}
          ></span>
          {isThinking ? "JARVIS Engine Thinking..." : "System Online"}
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Dynamic Evaluation Bar Panel */}
        <div className="lg:col-span-1 flex justify-center h-[450px] sm:h-[500px]">
          <div className="w-6 h-full bg-zinc-900 rounded-full overflow-hidden border border-white/10 relative flex flex-col justify-end shadow-2xl">
            <div
              className="w-full bg-white transition-all duration-500 ease-out shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              style={{ height: `${getEvalPercentage()}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference font-mono text-[10px] font-bold text-white tracking-tighter">
              {evaluation}
            </div>
          </div>
        </div>

        {/* Board Panel */}
        <div className="lg:col-span-7 flex justify-center">
          <ChessBoard fen={currentFen} onMove={handleMove} />
        </div>

        {/* Side Control Dashboard */}
        <div className="lg:col-span-4 h-[450px] sm:h-[500px] flex flex-col justify-between p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-gray-200">
          <div>
            <h2 className="text-lg font-semibold border-b border-white/10 pb-3 flex items-center gap-2">
              <TermIcon size={18} className="text-blue-400" /> Live Engine
              Analysis
            </h2>

            {/* Engine Stats Frame */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Cpu size={12} /> Evaluation
                </div>
                <div className="text-xl font-mono font-bold text-white mt-1">
                  {evaluation}
                </div>
              </div>
              <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <TrendingUp size={12} /> Advantage
                </div>
                <div className="text-sm font-medium text-blue-400 mt-2">
                  {evaluation.toString().startsWith("M")? evaluation.includes("-")? "Black has forced mate": "White has forced mate"
                    : parseFloat(evaluation) > 0? "White is better": parseFloat(evaluation) < 0? "Black is better": "Even Position"}
                </div>
              </div>
            </div>

            {/* Suggested Continuation Line */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Engine Best Line
              </h3>
              <div className="p-4 bg-black/30 rounded-xl border border-white/5 font-mono text-sm min-h-[96px] flex flex-wrap gap-2 items-center content-center">
                {bestLine.length > 0 ? (
                  bestLine.map((move, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-200 shadow-sm text-xs"
                    >
                      {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ""}
                      {move}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic text-xs w-full text-center">
                    Waiting for pieces to move...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* FEN Output Footer */}
          <div className="text-[11px] font-mono bg-black/40 p-3 rounded-lg border border-white/5 text-gray-400 break-all select-all">
            <span className="text-blue-400">FEN:</span> {currentFen}
          </div>
        </div>
      </main>
    </div>
  );
}

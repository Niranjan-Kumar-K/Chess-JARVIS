import React, { useEffect, useRef } from 'react';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import './ChessBoard.css'; // Import the CSS file for board styling
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css'; 

export default function ChessBoard({ fen, onMove }) {
  const boardRef = useRef(null);
  const chessRef = useRef(new Chess(fen));

  // Keep internal chess logic in sync with parent FEN state updates
  useEffect(() => {
    if (chessRef.current.fen() !== fen) {
      chessRef.current = new Chess(fen);
    }
  }, [fen]);

  useEffect(() => {
    if (!boardRef.current) return;

    const currentTurn = chessRef.current.turn() === 'w' ? 'white' : 'black';

    const ground = Chessground(boardRef.current, {
      fen: fen,
      turnColor: currentTurn,
      movable: {
        color: currentTurn, 
        free: false,
        dests: getValidMoves(chessRef.current),
      },
      events: {
        move: (orig, dest) => {
          const move = chessRef.current.move({ from: orig, to: dest, promotion: 'q' });
          if (move && onMove) {
            onMove(chessRef.current.fen());
          }
        },
      },
    });

    return () => ground.destroy();
  }, [fen, onMove]);

  function getValidMoves(chessInstance) {
    const dests = new Map();
    chessInstance.moves({ verbose: true }).forEach((m) => {
      if (!dests.has(m.from)) dests.set(m.from, []);
      dests.get(m.from).push(m.to);
    });
    return dests;
  }

  return (
    <div className="relative p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">

      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div 
        ref={boardRef} 
        className="rounded-lg overflow-hidden jarvis-board-container brown"
      />
    </div>
  );
}
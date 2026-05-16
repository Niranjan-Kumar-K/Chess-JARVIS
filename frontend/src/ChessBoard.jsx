import { useEffect } from 'react';

function ChessBoard() {
  useEffect(() => {
    const stockfishWorker = new Worker('/stockfish.js');

    // Listen for engine evaluations and moves
    stockfishWorker.onmessage = (e) => {
      console.log("JARVIS Brain:", e.data);
    };

    // Initialize Universal Chess Interface (UCI)
    stockfishWorker.postMessage('uci');

    // Cleanup worker when component unmounts
    return () => stockfishWorker.terminate();
  }, []);

  return <div>Chess JARVIS UI Shell Ready</div>;
}

export default ChessBoard;
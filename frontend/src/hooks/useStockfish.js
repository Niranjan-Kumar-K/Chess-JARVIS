import { useState, useEffect, useRef } from "react";

export default function useStockfish(fen) {
  const [evaluation, setEvaluation] = useState("0.00");
  const [bestLine, setBestLine] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const workerRef = useRef(null);

  // 1. Core Engine Initialization Lifecycle Loop
  useEffect(() => {
    // Dynamic Blob URL creates a local execution origin to clear Same-Origin blocks
    const blobCode = `importScripts("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js");`;
    const blob = new Blob([blobCode], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);

    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const line = e.data;

      // Look for Stockfish engine calculation outputs
      if (line.startsWith("info depth") && line.includes("score")) {
        const parts = line.split(" ");
        const scoreIndex = parts.indexOf("score");

        if (scoreIndex !== -1) {
          const type = parts[scoreIndex + 1]; // Can be 'cp' (centipawns) or 'mate'
          const value = parseInt(parts[scoreIndex + 2], 10);

          if (type === "cp") {
            const numericScore = parseFloat((value / 100).toFixed(2));

            // 1. Determine whose turn it is from the current FEN
            const isWhiteTurn = fen.split(" ")[1] === "w";

            // 2. CRITICAL FIX: Stockfish returns scores relative to the side moving.
            // To get an absolute score (White's perspective), invert the score ONLY if it is Black's turn!
            const absoluteScore = isWhiteTurn ? numericScore : -numericScore;

            // 3. Format the display string with signs
            let displayString = absoluteScore.toFixed(2);
            if (absoluteScore > 0) displayString = `+${displayString}`;

            setEvaluation(displayString);
          } else if (type === "mate") {
            // Fix mate scores similarly so Black mates show as negative numbers
            const isWhiteTurn = fen.split(" ")[1] === "w";
            const absoluteMate = isWhiteTurn ? value : -value;

            setEvaluation(
              absoluteMate > 0
                ? `M${absoluteMate}`
                : `M-${Math.abs(absoluteMate)}`,
            );
          }
        //   if (type === "cp") {
        //     const numericScore = (value / 100).toFixed(2);
        //     // Flip the signs dynamically based on whose move it is inside the current FEN token
        //     const isWhiteTurn = fen.split(" ")[1] === "w";
        //     const displayScore = isWhiteTurn
        //       ? numericScore
        //       : (-numericScore).toFixed(2);

        //     // Format output strings cleanly
        //     const numericValue = parseFloat(displayScore);
        //     if (numericValue > 0) {
        //       setEvaluation(`+${numericScore}`);
        //     } else if (numericValue < 0) {
        //       setEvaluation(`${displayScore}`);
        //     } else {
        //       setEvaluation("0.00");
        //     }
        //   } else if (type === "mate") {
        //     setEvaluation(`M${Math.abs(value)}`);
        //   }
        }

        // Gather Principal Variation (PV) data lines
        const pvIndex = parts.indexOf("pv");
        if (pvIndex !== -1) {
          const moves = parts.slice(pvIndex + 1, pvIndex + 6); // Keep the top 5 moves
          setBestLine(moves);
        }
      }

      // Check for calculations wrapping up
      if (line.startsWith("bestmove")) {
        setIsThinking(false);
      }
    };

    // Spin up engine configuration commands
    worker.postMessage("uci");
    worker.postMessage("setoption name MultiPV value 1");
    worker.postMessage("isready");

    return () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  // 2. Position Event Listener Loop (Dispatches updates on move confirmations)
  useEffect(() => {
    if (workerRef.current && fen) {
      setIsThinking(true);
      workerRef.current.postMessage("stop"); // Terminate pending calculation runs
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage("go depth 13"); // Depth 13 offers snappy feedback loops in browser sandboxes
    }
  }, [fen]);

  return { evaluation, bestLine, isThinking };
}

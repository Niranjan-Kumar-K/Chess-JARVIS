import { useEffect } from 'react';
import ChessBoard from './ChessBoard';
function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="p-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          JARVIS Analysis Online
        </h1>
        <ChessBoard/>
        <p className="mt-4 text-slate-400">Environment Ready. Waiting for Chessboard...</p>
      </div>
    </div>
  )
}
export default App


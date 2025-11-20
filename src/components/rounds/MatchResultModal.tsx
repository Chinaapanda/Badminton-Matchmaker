import { Match } from "@/types";

interface MatchResultModalProps {
  match: Match | null;
  result: { winner: 1 | 2 | null; score: string };
  setResult: (res: { winner: 1 | 2 | null; score: string }) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function MatchResultModal({
  match,
  result,
  setResult,
  onClose,
  onSave,
}: MatchResultModalProps) {
  if (!match) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-bold mb-6 text-center">
          Record Match Result
        </h3>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => setResult({ ...result, winner: 1 })}
            className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
              result.winner === 1
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <span className="font-medium">
              {match.team1.map((p) => p.name).join(" & ")}
            </span>
            {result.winner === 1 && <span>🏆</span>}
          </button>

          <div className="text-center text-zinc-500 text-sm">VS</div>

          <button
            onClick={() => setResult({ ...result, winner: 2 })}
            className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
              result.winner === 2
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <span className="font-medium">
              {match.team2.map((p) => p.name).join(" & ")}
            </span>
            {result.winner === 2 && <span>🏆</span>}
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Score (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 21-19, 21-18"
            value={result.score}
            onChange={(e) => setResult({ ...result, score: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!result.winner}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
          >
            Save & Next
          </button>
        </div>
      </div>
    </div>
  );
}

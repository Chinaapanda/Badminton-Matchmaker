interface SettingsPanelProps {
  courts: number;
  setCourts: (n: number) => void;
  randomnessLevel: number;
  setRandomnessLevel: (n: number) => void;
  lineToken: string;
  setLineToken: (token: string) => void;
  onSave: () => void;
  onResetGame: () => void;
  onResetAll: () => void;
}

export default function SettingsPanel({
  courts,
  setCourts,
  randomnessLevel,
  setRandomnessLevel,
  lineToken,
  setLineToken,
  onSave,
  onResetGame,
  onResetAll,
}: SettingsPanelProps) {
  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Number of Courts
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={courts}
            onChange={(e) => setCourts(parseInt(e.target.value) || 1)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Randomness ({Math.round(randomnessLevel * 100)}%)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={randomnessLevel}
            onChange={(e) => setRandomnessLevel(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Higher values mean less strict balancing.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Line Notify Token
          </label>
          <input
            type="password"
            value={lineToken}
            onChange={(e) => setLineToken(e.target.value)}
            placeholder="Enter Line Notify Token"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Get a token from{" "}
            <a
              href="https://notify-bot.line.me/my/"
              target="_blank"
              className="text-emerald-500 hover:underline"
            >
              line.me
            </a>{" "}
            to receive match notifications.
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800 space-y-3">
        <button
          onClick={onSave}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={onResetGame}
          className="w-full bg-amber-900/20 hover:bg-amber-900/30 text-amber-500 py-3 rounded-lg font-medium transition-colors border border-amber-900/30"
        >
          Reset Current Session
        </button>
        <button
          onClick={onResetAll}
          className="w-full bg-red-900/20 hover:bg-red-900/30 text-red-500 py-3 rounded-lg font-medium transition-colors border border-red-900/30"
        >
          Factory Reset
        </button>
      </div>
    </div>
  );
}

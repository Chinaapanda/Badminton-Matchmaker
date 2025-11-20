import { Player } from "@/types";

interface PlayerRosterProps {
  players: Player[];
  newPlayerName: string;
  setNewPlayerName: (name: string) => void;
  onAddPlayer: () => void;
  onToggleActive: (id: string) => void;
  onRemovePlayer: (id: string) => void;
  onOpenSearch: () => void;
}

export default function PlayerRoster({
  players,
  newPlayerName,
  setNewPlayerName,
  onAddPlayer,
  onToggleActive,
  onRemovePlayer,
  onOpenSearch,
}: PlayerRosterProps) {
  const activePlayersCount = players.filter((p) => p.active).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold">Roster</h2>
          <p className="text-zinc-400 text-sm mt-1">
            {activePlayersCount} Active / {players.length} Total
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddPlayer()}
            placeholder="New player name..."
            className="flex-1 sm:w-64 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
          <button
            onClick={onAddPlayer}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            Add
          </button>
          <button
            onClick={onOpenSearch}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
            title="Add from registered users"
          >
            👤+
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {players.map((player) => (
          <div
            key={player.id}
            onClick={() => onToggleActive(player.id)}
            className={`group relative p-4 rounded-xl border transition-all cursor-pointer select-none ${
              player.active
                ? "bg-zinc-900 border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-900/10"
                : "bg-zinc-900/50 border-zinc-800 opacity-60 hover:opacity-100"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold truncate pr-2">{player.name}</div>
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  player.active ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Games: {player.gamesPlayed}</span>
              <span>ELO: {player.elo}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemovePlayer(player.id);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-all"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

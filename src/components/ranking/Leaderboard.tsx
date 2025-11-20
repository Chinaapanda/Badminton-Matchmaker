import { Player } from "@/types";

interface LeaderboardProps {
  players: Player[];
}

export default function Leaderboard({ players }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950/50 text-zinc-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium">Rank</th>
              <th className="p-4 font-medium">Player</th>
              <th className="p-4 font-medium text-center">ELO</th>
              <th className="p-4 font-medium text-center">W - L</th>
              <th className="p-4 font-medium text-center">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sortedPlayers.map((player, index) => {
              const total = player.wins + player.losses;
              const winRate =
                total > 0 ? Math.round((player.wins / total) * 100) : 0;
              return (
                <tr
                  key={player.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="p-4 text-zinc-500 font-mono">#{index + 1}</td>
                  <td className="p-4 font-medium">{player.name}</td>
                  <td className="p-4 text-center font-mono text-emerald-400">
                    {player.elo}
                  </td>
                  <td className="p-4 text-center text-zinc-400">
                    <span className="text-emerald-500">{player.wins}</span> -{" "}
                    <span className="text-red-500">{player.losses}</span>
                  </td>
                  <td className="p-4 text-center text-zinc-400">{winRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

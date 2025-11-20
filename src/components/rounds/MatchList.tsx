import { Match, Round } from "@/types";

interface MatchListProps {
  rounds: Round[];
  currentRound: number;
  activePlayersCount: number;
  loading: boolean;
  sendingNotify: boolean;
  onGenerateRound: () => void;
  onSendNotify: () => void;
  onFinishMatch: (match: Match) => void;
}

export default function MatchList({
  rounds,
  currentRound,
  activePlayersCount,
  loading,
  sendingNotify,
  onGenerateRound,
  onSendNotify,
  onFinishMatch,
}: MatchListProps) {
  const currentRoundData = rounds.length > 0 ? rounds[rounds.length - 1] : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Matches</h2>
          <p className="text-zinc-400 text-sm mt-1">Round {currentRound}</p>
        </div>
        <div className="flex gap-2">
          {rounds.length > 0 && (
            <button
              onClick={onSendNotify}
              disabled={sendingNotify}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {sendingNotify ? "Sending..." : "🔔 Notify"}
            </button>
          )}
          {activePlayersCount >= 4 && (
            <button
              onClick={onGenerateRound}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Round"}
            </button>
          )}
        </div>
      </div>

      {!currentRoundData ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
          <div className="text-4xl mb-4">🏸</div>
          <p className="text-zinc-500">No matches yet. Start a new round!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Matches */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentRoundData.matches.map((match) => (
              <div
                key={match.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <div className="flex justify-between items-center mb-6 pl-3">
                  <span className="text-zinc-400 font-medium text-sm uppercase tracking-wider">
                    Court {match.court}
                  </span>
                  <button
                    onClick={() => onFinishMatch(match)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition-colors border border-zinc-700"
                  >
                    Finish & Record
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 pl-3">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-lg">
                      {match.team1[0].name}
                    </div>
                    <div className="font-medium text-lg">
                      {match.team1[1].name}
                    </div>
                  </div>
                  <div className="text-zinc-600 font-bold text-xl italic">
                    VS
                  </div>
                  <div className="flex-1 space-y-1 text-right">
                    <div className="font-medium text-lg">
                      {match.team2[0].name}
                    </div>
                    <div className="font-medium text-lg">
                      {match.team2[1].name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sitting Out */}
          {currentRoundData.playersSittingOut.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
                Sitting Out
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentRoundData.playersSittingOut.map((p) => (
                  <span
                    key={p.id}
                    className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm border border-zinc-700"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {rounds.length > 1 && (
            <div className="pt-8 border-t border-zinc-800">
              <h3 className="text-lg font-bold mb-4">History</h3>
              <div className="space-y-2">
                {rounds
                  .slice(0, -1)
                  .reverse()
                  .map((round) => (
                    <div
                      key={round.roundNumber}
                      className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-4"
                    >
                      <div className="text-sm text-zinc-500 mb-2">
                        Round {round.roundNumber}
                      </div>
                      <div className="space-y-2">
                        {round.matches.map((m) => (
                          <div
                            key={m.id}
                            className="flex justify-between text-sm"
                          >
                            <span
                              className={
                                m.winner === 1
                                  ? "text-emerald-400 font-medium"
                                  : "text-zinc-400"
                              }
                            >
                              {m.team1.map((p) => p.name).join(" & ")}
                            </span>
                            <span className="text-zinc-600 mx-2">
                              {m.score || "vs"}
                            </span>
                            <span
                              className={
                                m.winner === 2
                                  ? "text-emerald-400 font-medium"
                                  : "text-zinc-400"
                              }
                            >
                              {m.team2.map((p) => p.name).join(" & ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

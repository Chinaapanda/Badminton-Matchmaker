"use client";

import { useEffect, useState } from "react";

interface Player {
  id: string;
  name: string;
  gamesPlayed: number;
  lastPlayedRound: number;
  restRounds: number;
}

interface Match {
  court: number;
  team1: [Player, Player];
  team2: [Player, Player];
}

interface Round {
  roundNumber: number;
  matches: Match[];
  playersPlaying: Player[];
  playersSittingOut: Player[];
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [courts, setCourts] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"players" | "rounds" | "stats">(
    "players"
  );

  useEffect(() => {
    // Load saved configuration from localStorage and server
    const loadSavedConfig = async () => {
      try {
        // First try to get from localStorage
        const saved = localStorage.getItem("badminton-matchmaker-config");
        if (saved) {
          const config = JSON.parse(saved);
          setCourts(config.courts || 1);
        }

        // Also fetch from server as backup
        const response = await fetch("/api/config");
        if (response.ok) {
          const serverConfig = await response.json();
          setCourts(serverConfig.courts || 1);
        }
      } catch (error) {
        console.warn("Failed to load saved configuration:", error);
      }
    };

    loadSavedConfig();
    fetchPlayers();
    fetchRounds();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch("/api/players");
      const data = await response.json();
      setPlayers(data.players);
    } catch (err) {
      setError("Failed to fetch players");
    }
  };

  const fetchRounds = async () => {
    try {
      const response = await fetch("/api/rounds");
      const data = await response.json();
      setRounds(data.rounds);
      setCurrentRound(data.currentRound);
    } catch (err) {
      setError("Failed to fetch rounds");
    }
  };

  const addPlayer = async () => {
    if (!newPlayerName.trim()) return;

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlayerName.trim() }),
      });

      if (response.ok) {
        setNewPlayerName("");
        fetchPlayers();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add player");
      }
    } catch (err) {
      setError("Failed to add player");
    }
  };

  const removePlayer = async (playerId: string) => {
    try {
      const response = await fetch("/api/players", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });

      if (response.ok) {
        fetchPlayers();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove player");
      }
    } catch (err) {
      setError("Failed to remove player");
    }
  };

  const generateRound = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/rounds", {
        method: "POST",
      });

      if (response.ok) {
        fetchRounds();
        fetchPlayers();
        setActiveTab("rounds");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to generate round");
      }
    } catch (err) {
      setError("Failed to generate round");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async () => {
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courts }),
      });

      if (response.ok) {
        fetchRounds();
        fetchPlayers();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update configuration");
      }
    } catch (err) {
      setError("Failed to update configuration");
    }
  };

  const resetAll = async () => {
    if (
      !confirm(
        "Are you sure you want to reset everything? This will clear all players and rounds."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset: true,
          courts,
        }),
      });

      if (response.ok) {
        fetchRounds();
        fetchPlayers();
        setError("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to reset");
      }
    } catch (err) {
      setError("Failed to reset");
    }
  };

  const getPlayerStats = () => {
    const totalGames = players.reduce((sum, p) => sum + p.gamesPlayed, 0);
    const avgGames =
      players.length > 0 ? (totalGames / players.length).toFixed(1) : "0";
    const maxGames = Math.max(...players.map((p) => p.gamesPlayed), 0);
    const minGames = Math.min(...players.map((p) => p.gamesPlayed), 0);

    return { totalGames, avgGames, maxGames, minGames };
  };

  return (
    <div className="space-y-4 sm:space-y-8 animate-fade-in">
      {/* Error Alert */}
      {error && (
        <div className="animate-bounce-in bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg sm:text-xl mr-2">⚠️</span>
              <span className="font-medium text-sm sm:text-base">{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700 text-lg sm:text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Configuration Section */}
      <div className="card card-hover">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient">
            ⚙️ Configuration
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={updateConfig}
              className="btn btn-secondary text-sm sm:text-base"
            >
              💾 Save Settings
            </button>
            <button
              onClick={resetAll}
              className="btn btn-danger text-sm sm:text-base"
            >
              🔄 Reset All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="stats-card">
            <label className="block text-base sm:text-lg font-semibold mb-3 text-gray-700">
              🏟️ Number of Courts
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={courts}
              onChange={(e) => setCourts(parseInt(e.target.value) || 1)}
              className="input w-full text-center text-xl sm:text-2xl font-bold"
            />
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              {courts * 4} players can play simultaneously
            </p>
          </div>

          <div className="stats-card">
            <div className="text-base sm:text-lg font-semibold mb-3 text-gray-700">
              👥 Players
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {players.length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              {players.length >= 4
                ? "Ready to generate matches!"
                : "Need at least 4 players"}
            </p>
          </div>

          <div className="stats-card">
            <div className="text-base sm:text-lg font-semibold mb-3 text-gray-700">
              🎯 Rounds
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {rounds.length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              {rounds.length > 0
                ? `Last round: ${rounds[rounds.length - 1].roundNumber}`
                : "No rounds yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-white/20 backdrop-blur-sm rounded-2xl p-2">
        <button
          onClick={() => setActiveTab("players")}
          className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            activeTab === "players"
              ? "bg-white text-blue-600 shadow-lg"
              : "text-white hover:bg-white/10"
          }`}
        >
          👥 Players
        </button>
        <button
          onClick={() => setActiveTab("rounds")}
          className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            activeTab === "rounds"
              ? "bg-white text-blue-600 shadow-lg"
              : "text-white hover:bg-white/10"
          }`}
        >
          🏆 Rounds
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            activeTab === "stats"
              ? "bg-white text-blue-600 shadow-lg"
              : "text-white hover:bg-white/10"
          }`}
        >
          📊 Stats
        </button>
      </div>

      {/* Players Tab */}
      {activeTab === "players" && (
        <div className="card card-hover animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gradient">
              👥 Player Management
            </h2>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {players.length}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPlayer()}
              placeholder="Enter player name..."
              className="input flex-1 text-sm sm:text-base"
            />
            <button
              onClick={addPlayer}
              className="btn btn-success text-sm sm:text-base"
            >
              ➕ Add Player
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="player-card animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="font-bold text-base sm:text-lg text-gray-800 truncate">
                    {player.name}
                  </div>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-500 hover:text-red-700 text-lg sm:text-xl font-bold hover:scale-110 transition-transform flex-shrink-0 ml-2"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Games:</span>
                    <span className="font-semibold text-blue-600">
                      {player.gamesPlayed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rest:</span>
                    <span className="font-semibold text-orange-600">
                      {player.restRounds}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {players.length >= 4 && (
            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={generateRound}
                disabled={loading}
                className="btn btn-primary text-base sm:text-xl px-8 sm:px-12 py-3 sm:py-4"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⚡</span>
                    Generating Round {currentRound + 1}...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="mr-2">🎯</span>
                    Generate Round {currentRound + 1}
                  </span>
                )}
              </button>
            </div>
          )}

          {players.length > 0 && players.length < 4 && (
            <div className="mt-6 sm:mt-8 text-center p-4 sm:p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <div className="text-xl sm:text-2xl mb-2">⚠️</div>
              <div className="text-base sm:text-lg font-semibold text-yellow-800">
                Need at least 4 players to generate matches
              </div>
              <div className="text-yellow-600 mt-2 text-sm sm:text-base">
                Currently have {players.length} player
                {players.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rounds Tab */}
      {activeTab === "rounds" && (
        <div className="space-y-4 sm:space-y-6 animate-slide-up">
          {/* Current/Latest Round */}
          {rounds.length > 0 && (
            <div className="card card-hover">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-gradient">
                  🏆 Round {rounds[rounds.length - 1].roundNumber}
                </h2>
                <div className="court-badge text-xs sm:text-sm">
                  {rounds[rounds.length - 1].matches.length} Court
                  {rounds[rounds.length - 1].matches.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {rounds[rounds.length - 1].matches.map((match, index) => (
                  <div
                    key={index}
                    className="match-card animate-bounce-in"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                        Court {match.court}
                      </h3>
                      <div className="court-badge text-xs sm:text-sm">VS</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center">
                      <div className="text-center">
                        <div className="team-badge mb-2 text-xs sm:text-sm">
                          Team 1
                        </div>
                        <div className="space-y-1">
                          <div className="text-base sm:text-lg font-semibold text-blue-700 truncate">
                            {match.team1[0].name}
                          </div>
                          <div className="text-base sm:text-lg font-semibold text-blue-700 truncate">
                            {match.team1[1].name}
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-gray-400">
                          VS
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="team-badge mb-2 text-xs sm:text-sm">
                          Team 2
                        </div>
                        <div className="space-y-1">
                          <div className="text-base sm:text-lg font-semibold text-green-700 truncate">
                            {match.team2[0].name}
                          </div>
                          <div className="text-base sm:text-lg font-semibold text-green-700 truncate">
                            {match.team2[1].name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {rounds[rounds.length - 1].playersSittingOut.length > 0 && (
                <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <h3 className="font-bold text-base sm:text-lg mb-3 text-yellow-800">
                    🪑 Sitting Out This Round:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {rounds[rounds.length - 1].playersSittingOut.map(
                      (player) => (
                        <span
                          key={player.id}
                          className="sitting-badge text-xs sm:text-sm"
                        >
                          {player.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Round History */}
          {rounds.length > 1 && (
            <div className="card card-hover">
              <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-4 sm:mb-6">
                📜 Round History
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {rounds
                  .slice(0, -1)
                  .reverse()
                  .map((round, index) => (
                    <details key={round.roundNumber} className="group">
                      <summary className="cursor-pointer font-semibold text-base sm:text-lg hover:text-blue-600 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <span className="mr-2">📋</span>
                        Round {round.roundNumber} ({round.matches.length} match
                        {round.matches.length !== 1 ? "es" : ""})
                      </summary>
                      <div className="mt-3 sm:mt-4 ml-2 sm:ml-4 space-y-2 sm:space-y-3">
                        {round.matches.map((match, matchIndex) => (
                          <div
                            key={matchIndex}
                            className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200"
                          >
                            <div className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                              Court {match.court}: {match.team1[0].name} &{" "}
                              {match.team1[1].name} vs {match.team2[0].name} &{" "}
                              {match.team2[1].name}
                            </div>
                          </div>
                        ))}
                        {round.playersSittingOut.length > 0 && (
                          <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg">
                            <strong>Sitting out:</strong>{" "}
                            {round.playersSittingOut
                              .map((p) => p.name)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
              </div>
            </div>
          )}

          {rounds.length === 0 && (
            <div className="card card-hover text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">🏸</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
                No Rounds Yet
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Generate your first round to see matches here!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="card card-hover animate-slide-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-4 sm:mb-6">
            📊 Statistics
          </h2>

          {players.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {(() => {
                  const stats = getPlayerStats();
                  return (
                    <>
                      <div className="stats-card text-center">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {stats.totalGames}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Total Games
                        </div>
                      </div>
                      <div className="stats-card text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          {stats.avgGames}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Avg Games/Player
                        </div>
                      </div>
                      <div className="stats-card text-center">
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">
                          {stats.maxGames}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Most Games
                        </div>
                      </div>
                      <div className="stats-card text-center">
                        <div className="text-xl sm:text-2xl font-bold text-orange-600">
                          {stats.minGames}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Least Games
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Player Stats Table */}
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl overflow-hidden shadow-lg">
                  <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-xs sm:text-sm">
                        Player
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm">
                        Games Played
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm">
                        Rest Rounds
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => (
                      <tr
                        key={player.id}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-800 text-xs sm:text-sm">
                          {player.name}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                            {player.gamesPlayed}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          <span className="bg-orange-100 text-orange-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                            {player.restRounds}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          {player.restRounds > 0 ? (
                            <span className="sitting-badge text-xs sm:text-sm">
                              Resting
                            </span>
                          ) : (
                            <span className="team-badge text-xs sm:text-sm">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">📊</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
                No Players Yet
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Add some players to see statistics here!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      {players.length >= 4 && (
        <button
          onClick={generateRound}
          disabled={loading}
          className="floating-action"
          title="Generate Next Round"
        >
          {loading ? (
            <span className="animate-spin text-xl sm:text-2xl">⚡</span>
          ) : (
            <span className="text-xl sm:text-2xl">🎯</span>
          )}
        </button>
      )}
    </div>
  );
}

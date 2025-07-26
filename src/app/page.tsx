"use client";

import {
  getMatchmaker,
  resetMatchmaker,
  updateConfiguration as updateMatchmakerConfig,
} from "@/lib/matchmaker-instance";
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
  const [randomnessLevel, setRandomnessLevel] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"players" | "rounds" | "stats">(
    "players"
  );

  useEffect(() => {
    // Load saved configuration and data from localStorage
    const matchmaker = getMatchmaker();
    const config = matchmaker.getConfiguration();
    setCourts(config.courts || 1);
    setRandomnessLevel(config.randomnessLevel || 0.5);
    setPlayers(matchmaker.getPlayers());
    setRounds(matchmaker.getRounds());
    setCurrentRound(matchmaker.getCurrentRound());
  }, []);

  const fetchPlayers = () => {
    const matchmaker = getMatchmaker();
    setPlayers(matchmaker.getPlayers());
  };

  const fetchRounds = () => {
    const matchmaker = getMatchmaker();
    setRounds(matchmaker.getRounds());
    setCurrentRound(matchmaker.getCurrentRound());
  };

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    try {
      const matchmaker = getMatchmaker();
      matchmaker.addPlayer(newPlayerName.trim());
      setNewPlayerName("");
      fetchPlayers();
    } catch (err) {
      setError("Failed to add player");
    }
  };

  const removePlayer = (playerId: string) => {
    try {
      const matchmaker = getMatchmaker();
      matchmaker.removePlayer(playerId);
      fetchPlayers();
    } catch (err) {
      setError("Failed to remove player");
    }
  };

  const generateRound = () => {
    setLoading(true);
    try {
      const matchmaker = getMatchmaker();
      matchmaker.generateNextRound();
      fetchRounds();
      fetchPlayers();
      setActiveTab("rounds");
    } catch (err: any) {
      setError(err.message || "Failed to generate round");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = () => {
    try {
      updateMatchmakerConfig(courts, randomnessLevel);
      fetchRounds();
      fetchPlayers();
    } catch (err) {
      setError("Failed to update configuration");
    }
  };

  const resetAll = () => {
    if (
      !confirm(
        "Are you sure you want to reset everything? This will clear all players and rounds."
      )
    ) {
      return;
    }
    try {
      // Clear all localStorage data
      localStorage.removeItem("badminton-matchmaker-data");
      localStorage.removeItem("badminton-matchmaker-config");

      // Reset the matchmaker instance
      resetMatchmaker(courts, randomnessLevel);

      // Reset React state
      setPlayers([]);
      setRounds([]);
      setCurrentRound(0);
      setError("");
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={updateConfig}
              className="btn btn-secondary text-sm sm:text-base py-3 sm:py-3 min-h-[44px]"
            >
              💾 Save Settings
            </button>
            <button
              onClick={resetAll}
              className="btn btn-danger text-sm sm:text-base py-3 sm:py-3 min-h-[44px]"
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
              className="input w-full text-center text-xl sm:text-2xl font-bold min-h-[44px]"
            />
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              {courts * 4} players can play simultaneously
            </p>
          </div>

          <div className="stats-card">
            <label className="block text-base sm:text-lg font-semibold mb-3 text-gray-700">
              🎲 Randomness Level
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={randomnessLevel}
                onChange={(e) => setRandomnessLevel(parseFloat(e.target.value))}
                className="flex-1 h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-center">
                {Math.round(randomnessLevel * 100)}%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              {randomnessLevel === 0
                ? "Deterministic (same result every time)"
                : randomnessLevel < 0.3
                ? "Low randomness (mostly fair)"
                : randomnessLevel < 0.7
                ? "Medium randomness (balanced)"
                : "High randomness (more variety)"}
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
        </div>

        {/* Generate Round Button - Always Accessible */}
        {players.length >= 4 && (
          <div className="mt-6 sm:mt-8 text-center">
            <button
              onClick={generateRound}
              disabled={loading}
              className="btn btn-primary text-base sm:text-xl px-8 sm:px-12 py-4 sm:py-4 shadow-2xl hover:shadow-3xl min-h-[56px] w-full sm:w-auto"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⚡</span>
                  Generating Round {currentRound + 1}...
                </span>
              ) : (
                <span className="flex items-center justify-center">
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

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-white/20 backdrop-blur-sm rounded-2xl p-2">
        <button
          onClick={() => setActiveTab("players")}
          className={`flex-1 py-3 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base min-h-[44px] ${
            activeTab === "players"
              ? "bg-white text-blue-600 shadow-lg"
              : "text-white hover:bg-white/10"
          }`}
        >
          👥 Players
        </button>
        <button
          onClick={() => setActiveTab("rounds")}
          className={`flex-1 py-3 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base min-h-[44px] ${
            activeTab === "rounds"
              ? "bg-white text-blue-600 shadow-lg"
              : "text-white hover:bg-white/10"
          }`}
        >
          🏆 Rounds
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-3 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base min-h-[44px] ${
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

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPlayer()}
              placeholder="Enter player name..."
              className="input flex-1 text-sm sm:text-base min-h-[44px]"
            />
            <button
              onClick={addPlayer}
              className="btn btn-success text-sm sm:text-base py-3 sm:py-3 min-h-[44px]"
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
                  <div className="font-bold text-base sm:text-lg text-gray-800 truncate flex-1 mr-2">
                    {player.name}
                  </div>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-500 hover:text-red-700 text-lg sm:text-xl font-bold hover:scale-110 transition-transform flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Remove player"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Games:</span>
                    <span className="font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs">
                      {player.gamesPlayed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rest:</span>
                    <span className="font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-xs">
                      {player.restRounds}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                          <div className="text-sm sm:text-lg font-semibold text-blue-700 truncate px-1">
                            {match.team1[0].name}
                          </div>
                          <div className="text-sm sm:text-lg font-semibold text-blue-700 truncate px-1">
                            {match.team1[1].name}
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-4xl font-bold text-gray-400">
                          VS
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="team-badge mb-2 text-xs sm:text-sm">
                          Team 2
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm sm:text-lg font-semibold text-green-700 truncate px-1">
                            {match.team2[0].name}
                          </div>
                          <div className="text-sm sm:text-lg font-semibold text-green-700 truncate px-1">
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
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Generate your first round to see matches here!
              </p>
              {players.length >= 4 && (
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
              )}
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
                      <th className="px-2 sm:px-6 py-3 sm:py-4 text-left font-semibold text-xs sm:text-sm">
                        Player
                      </th>
                      <th className="px-1 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm">
                        Games
                      </th>
                      <th className="px-1 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm">
                        Rest
                      </th>
                      <th className="px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-sm">
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
                        <td className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-800 text-xs sm:text-sm max-w-[120px] sm:max-w-none">
                          <div className="truncate" title={player.name}>
                            {player.name}
                          </div>
                        </td>
                        <td className="px-1 sm:px-6 py-3 sm:py-4 text-center">
                          <span className="bg-blue-100 text-blue-800 px-1 sm:px-3 py-1 rounded-full text-xs font-medium">
                            {player.gamesPlayed}
                          </span>
                        </td>
                        <td className="px-1 sm:px-6 py-3 sm:py-4 text-center">
                          <span className="bg-orange-100 text-orange-800 px-1 sm:px-3 py-1 rounded-full text-xs font-medium">
                            {player.restRounds}
                          </span>
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                          {player.restRounds > 0 ? (
                            <span className="sitting-badge text-xs">
                              Resting
                            </span>
                          ) : (
                            <span className="team-badge text-xs">Active</span>
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
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Add some players to see statistics here!
              </p>
              <button
                onClick={() => setActiveTab("players")}
                className="btn btn-primary text-base sm:text-xl px-8 sm:px-12 py-3 sm:py-4"
              >
                <span className="mr-2">👥</span>
                Go to Players Tab
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button - Always Visible When Ready */}
      {players.length >= 4 && (
        <button
          onClick={generateRound}
          disabled={loading}
          className="floating-action shadow-2xl hover:shadow-3xl transition-all duration-300"
          title="Generate Next Round"
        >
          {loading ? (
            <span className="animate-spin text-xl sm:text-2xl">⚡</span>
          ) : (
            <span className="text-xl sm:text-2xl">🎯</span>
          )}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {currentRound + 1}
          </div>
        </button>
      )}
    </div>
  );
}

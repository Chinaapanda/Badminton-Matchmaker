"use client";

import {
  getMatchmaker,
  resetGame,
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
  const [finishingCourt, setFinishingCourt] = useState<number | null>(null);
  const [showNewMatchPreview, setShowNewMatchPreview] = useState<number | null>(
    null
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

  const resetGameOnly = () => {
    if (
      !confirm(
        "Are you sure you want to reset the game? This will clear all rounds and player stats, but keep all players."
      )
    ) {
      return;
    }
    try {
      // Reset only game data
      resetGame();

      // Refresh data
      fetchRounds();
      fetchPlayers();
      setError("");
    } catch (err) {
      setError("Failed to reset game");
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

  // Add new function to finish court and generate new match
  const finishCourtAndGenerateNew = async (courtNumber: number) => {
    setFinishingCourt(courtNumber);
    try {
      const matchmaker = getMatchmaker();
      const updatedRound = matchmaker.finishCourtAndGenerateNew(courtNumber);
      fetchRounds();
      fetchPlayers();

      // Show success message
      setError(""); // Clear any previous errors
    } catch (err: any) {
      setError(err.message || "Failed to finish court");
    } finally {
      setFinishingCourt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
              🏸 Badminton Matchmaker
            </h1>
            <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto">
              Smart tournament management with fair player rotation and
              real-time court management
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 space-y-6">
        {error && (
          <div className="animate-bounce-in bg-red-500/10 backdrop-blur-md border border-red-500/30 text-red-200 p-4 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-300 hover:text-red-100 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card text-center p-6">
            <div className="text-3xl font-bold text-blue-300 mb-2">
              {players.length}
            </div>
            <div className="text-blue-100 text-sm">Total Players</div>
          </div>
          <div className="glass-card text-center p-6">
            <div className="text-3xl font-bold text-green-300 mb-2">
              {rounds.length}
            </div>
            <div className="text-green-100 text-sm">Rounds Played</div>
          </div>
          <div className="glass-card text-center p-6">
            <div className="text-3xl font-bold text-purple-300 mb-2">
              {courts}
            </div>
            <div className="text-purple-100 text-sm">Active Courts</div>
          </div>
          <div className="glass-card text-center p-6">
            <div className="text-3xl font-bold text-orange-300 mb-2">
              {Math.round(randomnessLevel * 100)}%
            </div>
            <div className="text-orange-100 text-sm">Randomness</div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">⚙️</span>
              Tournament Settings
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={updateConfig} className="btn-modern btn-primary">
                💾 Save Settings
              </button>
              <button
                onClick={resetGameOnly}
                className="btn-modern btn-warning"
              >
                🎮 Reset Game
              </button>
              <button onClick={resetAll} className="btn-modern btn-danger">
                🔄 Reset All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 font-semibold mb-3">
                  🏟️ Number of Courts
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={courts}
                    onChange={(e) => setCourts(parseInt(e.target.value) || 1)}
                    className="input-modern w-full text-center text-2xl font-bold"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm">
                    {courts * 4} players
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 font-semibold mb-3">
                  🎲 Randomness Level
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={randomnessLevel}
                      onChange={(e) =>
                        setRandomnessLevel(parseFloat(e.target.value))
                      }
                      className="slider-modern flex-1"
                    />
                    <span className="text-white font-bold min-w-[4rem] text-center">
                      {Math.round(randomnessLevel * 100)}%
                    </span>
                  </div>
                  <p className="text-blue-200 text-sm">
                    {randomnessLevel === 0
                      ? "Deterministic (same result every time)"
                      : randomnessLevel < 0.3
                      ? "Low randomness (mostly fair)"
                      : randomnessLevel < 0.7
                      ? "Medium randomness (balanced)"
                      : "High randomness (more variety)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Round Button */}
          {players.length >= 4 && (
            <div className="mt-8 text-center space-y-4">
              <button
                onClick={generateRound}
                disabled={loading}
                className="btn-modern btn-primary text-xl px-12 py-4 shadow-2xl hover:shadow-2xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-3 text-2xl">⚡</span>
                    Generating Round {currentRound + 1}...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-3 text-2xl">🎯</span>
                    Generate Round {currentRound + 1}
                  </span>
                )}
              </button>
              <div className="text-sm text-blue-200 max-w-2xl mx-auto space-y-2">
                <div>
                  💡 <strong>Tip:</strong> ใช้ปุ่ม "Finish & New"
                  ในแต่ละสนามเพื่อจบเกมและสร้างเกมใหม่ทันที
                  ระบบจะสุ่มผู้เล่นจากคนที่เพิ่งจบเกมและคนที่นั่งรอ
                  เพื่อให้การหมุนเวียนยุติธรรม
                </div>
                <div>
                  🎮 <strong>Reset Game:</strong> รีเซ็ตเฉพาะเกม/รอบการแข่งขัน
                  แต่ยังคงผู้เล่นไว้
                  เหมาะสำหรับเริ่มเกมใหม่โดยไม่ต้องเพิ่มผู้เล่นใหม่
                </div>
              </div>
            </div>
          )}

          {players.length > 0 && players.length < 4 && (
            <div className="mt-8 text-center p-6 bg-yellow-500/10 backdrop-blur-md rounded-2xl border border-yellow-500/30">
              <div className="text-3xl mb-3">⚠️</div>
              <div className="text-yellow-200 font-semibold text-lg mb-2">
                Need at least 4 players to generate matches
              </div>
              <div className="text-yellow-300">
                Currently have {players.length} player
                {players.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="glass-card p-2">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setActiveTab("players")}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "players"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-blue-200 hover:bg-white/10"
              }`}
            >
              👥 Players
            </button>
            <button
              onClick={() => setActiveTab("rounds")}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "rounds"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-blue-200 hover:bg-white/10"
              }`}
            >
              🏆 Rounds
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "stats"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-blue-200 hover:bg-white/10"
              }`}
            >
              📊 Stats
            </button>
          </div>
        </div>

        {/* Players Tab */}
        {activeTab === "players" && (
          <div className="glass-card p-6 animate-slide-up">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-3">👥</span>
                Player Management
              </h2>
              <div className="text-3xl font-bold text-blue-300">
                {players.length}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                placeholder="Enter player name..."
                className="input-modern flex-1"
              />
              <button onClick={addPlayer} className="btn-modern btn-success">
                ➕ Add Player
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="player-card-modern animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-lg text-white truncate flex-1 mr-3">
                      {player.name}
                    </div>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-red-400 hover:text-red-200 text-xl font-bold hover:scale-110 transition-transform"
                      title="Remove player"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Games:</span>
                      <span className="badge-modern badge-blue">
                        {player.gamesPlayed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Rest:</span>
                      <span className="badge-modern badge-orange">
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
          <div className="space-y-6 animate-slide-up">
            {/* Current/Latest Round */}
            {rounds.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-2 lg:space-y-0">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="mr-3">🏆</span>
                    Round {rounds[rounds.length - 1].roundNumber}
                  </h2>
                  <div className="badge-modern badge-purple">
                    {rounds[rounds.length - 1].matches.length} Court
                    {rounds[rounds.length - 1].matches.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {rounds[rounds.length - 1].matches.map((match, index) => (
                    <div
                      key={index}
                      className="match-card-modern animate-bounce-in"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">
                          Court {match.court}
                        </h3>
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={() =>
                              finishCourtAndGenerateNew(match.court)
                            }
                            disabled={finishingCourt === match.court}
                            className="btn-modern btn-success text-sm"
                          >
                            {finishingCourt === match.court ? (
                              <span className="flex items-center">
                                <span className="animate-spin mr-2">⚡</span>
                                Finishing...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <span className="mr-2">✅</span>
                                Finish & New
                              </span>
                            )}
                          </button>
                          <div className="text-xs text-blue-200 text-right max-w-[200px]">
                            สุ่มจากผู้เล่นที่จบเกม + คนที่นั่งรอ
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="team-section team-blue">
                          <div className="team-header">Team 1</div>
                          <div className="team-players">
                            <div className="player-name">
                              {match.team1[0].name}
                            </div>
                            <div className="player-name">
                              {match.team1[1].name}
                            </div>
                          </div>
                        </div>

                        <div className="vs-section">
                          <div className="vs-text">VS</div>
                        </div>

                        <div className="team-section team-green">
                          <div className="team-header">Team 2</div>
                          <div className="team-players">
                            <div className="player-name">
                              {match.team2[0].name}
                            </div>
                            <div className="player-name">
                              {match.team2[1].name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {rounds[rounds.length - 1].playersSittingOut.length > 0 && (
                  <div className="mt-6 p-6 bg-yellow-500/10 backdrop-blur-md rounded-2xl border border-yellow-500/30">
                    <h3 className="font-bold text-lg mb-4 text-yellow-200">
                      🪑 Sitting Out This Round:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {rounds[rounds.length - 1].playersSittingOut.map(
                        (player) => (
                          <span
                            key={player.id}
                            className="badge-modern badge-yellow"
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
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">📜</span>
                  Round History
                </h2>
                <div className="space-y-4">
                  {rounds
                    .slice(0, -1)
                    .reverse()
                    .map((round, index) => (
                      <details key={round.roundNumber} className="group">
                        <summary className="cursor-pointer font-semibold text-lg hover:text-blue-300 p-4 bg-white/5 backdrop-blur-md rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center">
                          <span className="mr-3">📋</span>
                          Round {round.roundNumber} ({round.matches.length}{" "}
                          match{round.matches.length !== 1 ? "es" : ""})
                        </summary>
                        <div className="mt-4 ml-6 space-y-3">
                          {round.matches.map((match, matchIndex) => (
                            <div
                              key={matchIndex}
                              className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10"
                            >
                              <div className="font-semibold text-blue-200 mb-2">
                                Court {match.court}: {match.team1[0].name} &{" "}
                                {match.team1[1].name} vs {match.team2[0].name} &{" "}
                                {match.team2[1].name}
                              </div>
                            </div>
                          ))}
                          {round.playersSittingOut.length > 0 && (
                            <div className="text-sm text-blue-200 bg-white/5 p-3 rounded-lg">
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
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-6">🏸</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No Rounds Yet
                </h3>
                <p className="text-blue-200 mb-8">
                  Generate your first round to see matches here!
                </p>
                {players.length >= 4 && (
                  <button
                    onClick={generateRound}
                    disabled={loading}
                    className="btn-modern btn-primary text-xl px-12 py-4"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-3">⚡</span>
                        Generating Round {currentRound + 1}...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="mr-3">🎯</span>
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
          <div className="glass-card p-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3">📊</span>
              Statistics
            </h2>

            {players.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {(() => {
                    const stats = getPlayerStats();
                    return (
                      <>
                        <div className="stats-card-modern text-center">
                          <div className="text-3xl font-bold text-blue-300 mb-2">
                            {stats.totalGames}
                          </div>
                          <div className="text-blue-200 text-sm">
                            Total Games
                          </div>
                        </div>
                        <div className="stats-card-modern text-center">
                          <div className="text-3xl font-bold text-green-300 mb-2">
                            {stats.avgGames}
                          </div>
                          <div className="text-green-200 text-sm">
                            Avg Games/Player
                          </div>
                        </div>
                        <div className="stats-card-modern text-center">
                          <div className="text-3xl font-bold text-purple-300 mb-2">
                            {stats.maxGames}
                          </div>
                          <div className="text-purple-200 text-sm">
                            Most Games
                          </div>
                        </div>
                        <div className="stats-card-modern text-center">
                          <div className="text-3xl font-bold text-orange-300 mb-2">
                            {stats.minGames}
                          </div>
                          <div className="text-orange-200 text-sm">
                            Least Games
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Player Stats Table */}
                <div className="overflow-x-auto">
                  <table className="w-full bg-white/5 backdrop-blur-md rounded-xl overflow-hidden">
                    <thead className="bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-white">
                          Player
                        </th>
                        <th className="px-6 py-4 text-center font-semibold text-white">
                          Games
                        </th>
                        <th className="px-6 py-4 text-center font-semibold text-white">
                          Rest
                        </th>
                        <th className="px-6 py-4 text-center font-semibold text-white">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player, index) => (
                        <tr
                          key={player.id}
                          className={
                            index % 2 === 0 ? "bg-white/5" : "bg-white/10"
                          }
                        >
                          <td className="px-6 py-4 font-semibold text-white max-w-[200px]">
                            <div className="truncate" title={player.name}>
                              {player.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="badge-modern badge-blue">
                              {player.gamesPlayed}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="badge-modern badge-orange">
                              {player.restRounds}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {player.restRounds > 0 ? (
                              <span className="badge-modern badge-yellow">
                                Resting
                              </span>
                            ) : (
                              <span className="badge-modern badge-green">
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
              <div className="text-center py-12">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No Players Yet
                </h3>
                <p className="text-blue-200 mb-8">
                  Add some players to see statistics here!
                </p>
                <button
                  onClick={() => setActiveTab("players")}
                  className="btn-modern btn-primary text-xl px-12 py-4"
                >
                  <span className="mr-3">👥</span>
                  Go to Players Tab
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Action Button */}
        {players.length >= 4 && (
          <button
            onClick={generateRound}
            disabled={loading}
            className="floating-action-modern"
            title="Generate Next Round"
          >
            {loading ? (
              <span className="animate-spin text-2xl">⚡</span>
            ) : (
              <span className="text-2xl">🎯</span>
            )}
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {currentRound + 1}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

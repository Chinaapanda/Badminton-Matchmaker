"use client";

import PlayerRoster from "@/components/players/PlayerRoster";
import PlayerSearchModal from "@/components/players/PlayerSearchModal";
import Leaderboard from "@/components/ranking/Leaderboard";
import MatchList from "@/components/rounds/MatchList";
import MatchResultModal from "@/components/rounds/MatchResultModal";
import SettingsPanel from "@/components/settings/SettingsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/lib/api/auth";
import { addPlayer as addPlayerDB, addPlayerFromProfile as addPlayerFromProfileDB, deletePlayer as deletePlayerDB, fetchPlayers, updatePlayerStats } from "@/lib/api/players";
import {
  getMatchmaker,
  resetGame,
  resetMatchmaker,
  updateConfiguration as updateMatchmakerConfig,
} from "@/lib/matchmaker-instance";
import { Match, Player, Round } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Home() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [courts, setCourts] = useState(1);
  const [randomnessLevel, setRandomnessLevel] = useState(0.5);
  const [lineToken, setLineToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingNotify, setSendingNotify] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"players" | "rounds" | "ranking" | "settings">("players");
  const [finishingMatch, setFinishingMatch] = useState<Match | null>(null);
  const [matchResult, setMatchResult] = useState<{ winner: 1 | 2 | null; score: string }>({ winner: null, score: "" });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    // Load saved configuration and data from localStorage
    const matchmaker = getMatchmaker();
    const config = matchmaker.getConfiguration();
    setCourts(config.courts || 1);
    setRandomnessLevel(config.randomnessLevel || 0.5);
    
    // Load Line Token from localStorage manually as it's not in the core matchmaker config yet
    const savedToken = localStorage.getItem("badminton-line-token");
    if (savedToken) setLineToken(savedToken);

    // Load players from Supabase
    loadPlayersFromSupabase();

    refreshData();
  }, []);

  const loadPlayersFromSupabase = async () => {
    try {
      const playersFromDB = await fetchPlayers();
      
      // Sync players to matchmaker
      const matchmaker = getMatchmaker();
      matchmaker.clearPlayers(); // Clear local players first
      
      playersFromDB.forEach((dbPlayer: { id: string; name: string; elo: number; wins: number; losses: number }) => {
        // Add each player to the matchmaker with their stats
        matchmaker.addPlayer(dbPlayer.name, {
          id: dbPlayer.id,
          elo: dbPlayer.elo,
          wins: dbPlayer.wins,
          losses: dbPlayer.losses,
        });
      });


      refreshData();
    } catch (err) {
      console.error('Failed to load players from Supabase:', err);
      setError('Failed to load players from database');
    }
  };


  const refreshData = () => {
    const matchmaker = getMatchmaker();
    setPlayers(matchmaker.getPlayers());
    setRounds(matchmaker.getRounds());
    setCurrentRound(matchmaker.getCurrentRound());
  };

  const addPlayer = async () => {
    if (!newPlayerName.trim()) return;
    try {
      // Add to Supabase first
      const newPlayer = await addPlayerDB(newPlayerName.trim());
      
      // Then add to matchmaker with the same ID
      const matchmaker = getMatchmaker();
      matchmaker.addPlayer(newPlayer.name, {
        id: newPlayer.id,
        elo: newPlayer.elo,
        wins: newPlayer.wins,
        losses: newPlayer.losses,
      });
      
      setNewPlayerName("");
      refreshData();
    } catch (err) {
      console.error('Failed to add player:', err);
      setError("Failed to add player to database");
    }
  };


  const removePlayer = async (playerId: string) => {
    if (!confirm("Remove this player?")) return;
    try {
      // Delete from Supabase first
      await deletePlayerDB(playerId);
      
      // Then remove from matchmaker
      const matchmaker = getMatchmaker();
      matchmaker.removePlayer(playerId);
      refreshData();
    } catch (err) {
      console.error('Failed to remove player:', err);
      setError("Failed to remove player from database");
    }
  };


  const togglePlayerActive = (playerId: string) => {
    try {
      const matchmaker = getMatchmaker();
      matchmaker.togglePlayerActive(playerId);
      refreshData();
    } catch (err) {
      setError("Failed to toggle player status");
    }
  };

  const addPlayerFromUserProfile = async (profile: Profile) => {
    try {
      // Add to Supabase with profile's stats
      const newPlayer = await addPlayerFromProfileDB(
        profile.id,
        profile.display_name || profile.email || "Unknown",
        profile.elo,
        profile.wins,
        profile.losses
      );
      
      // Then add to matchmaker with the same ID and stats
      const matchmaker = getMatchmaker();
      matchmaker.addPlayer(newPlayer.name, {
        id: newPlayer.id,
        elo: newPlayer.elo,
        wins: newPlayer.wins,
        losses: newPlayer.losses,
      });
      
      refreshData();
      setShowSearchModal(false);
    } catch (err) {
      console.error('Failed to add player from profile:', err);
      setError("Failed to add player from profile");
    }
  };

  const generateRound = () => {
    setLoading(true);
    try {
      const matchmaker = getMatchmaker();
      matchmaker.generateNextRound();
      refreshData();
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
      localStorage.setItem("badminton-line-token", lineToken);
      refreshData();
      alert("Settings saved!");
    } catch (err) {
      setError("Failed to update configuration");
    }
  };

  const resetAll = () => {
    if (!confirm("Reset EVERYTHING? This cannot be undone.")) return;
    try {
      localStorage.removeItem("badminton-matchmaker-data");
      localStorage.removeItem("badminton-matchmaker-config");
      localStorage.removeItem("badminton-line-token");
      setLineToken("");
      resetMatchmaker(courts, randomnessLevel);
      refreshData();
      setError("");
    } catch (err) {
      setError("Failed to reset");
    }
  };

  const resetGameOnly = () => {
    if (!confirm("Reset current game session? Players will remain.")) return;
    try {
      resetGame();
      refreshData();
      setError("");
    } catch (err) {
      setError("Failed to reset game");
    }
  };

  const openFinishModal = (match: Match) => {
    setFinishingMatch(match);
    setMatchResult({ winner: null, score: "" });
  };

  const closeFinishModal = () => {
    setFinishingMatch(null);
  };

  const saveMatchResult = async () => {
    if (!finishingMatch || !matchResult.winner) {
      alert("Please select a winner");
      return;
    }
    try {
      const matchmaker = getMatchmaker();
      matchmaker.recordMatchResult(finishingMatch.id, matchResult.winner, matchResult.score);
      
      // Get all players involved in the match and sync their stats to Supabase
      const allMatchPlayers = [...finishingMatch.team1, ...finishingMatch.team2];
      for (const player of allMatchPlayers) {
        const updatedPlayer = matchmaker.getPlayers().find(p => p.id === player.id);
        if (updatedPlayer) {
          await updatePlayerStats(updatedPlayer.id, {
            elo: updatedPlayer.elo,
            wins: updatedPlayer.wins,
            losses: updatedPlayer.losses,
          });
        }
      }
      
      // Auto-generate new match for this court
      matchmaker.finishCourtAndGenerateNew(finishingMatch.court);
      
      refreshData();
      closeFinishModal();
    } catch (err: any) {
      console.error('Failed to save match result:', err);
      setError(err.message || "Failed to save result");
    }
  };


  const sendLineNotification = async () => {
    if (!lineToken) {
      alert("Please set a Line Notify Token in Settings first.");
      return;
    }
    if (rounds.length === 0) return;

    setSendingNotify(true);
    const round = rounds[rounds.length - 1];
    
    let message = `\n🏸 Round ${round.roundNumber} Matches 🏸\n`;
    round.matches.forEach(m => {
      message += `\nCourt ${m.court}:\n`;
      message += `${m.team1.map(p => p.name).join(" & ")} VS ${m.team2.map(p => p.name).join(" & ")}\n`;
    });

    if (round.playersSittingOut.length > 0) {
      message += `\nSitting out: ${round.playersSittingOut.map(p => p.name).join(", ")}`;
    }

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: lineToken, message }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert("Notification sent!");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError("Failed to send notification: " + err.message);
    } finally {
      setSendingNotify(false);
    }
  };

  // Derived state
  const activePlayersCount = players.filter(p => p.active).length;

  // Show login page if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    router.push('/login');
    return null;
  }

  // Check if user is banned
  if (profile.is_banned) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Account Suspended</h1>
          <p className="text-zinc-400 mb-6">Your account has been banned. Please contact an administrator for more information.</p>
          <button
            onClick={() => signOut()}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Minimal Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-zinc-950">B</div>
            <h1 className="text-lg font-bold tracking-tight">Badminton Matchmaker</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
              {(["players", "rounds", "ranking", "settings"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center text-sm font-medium">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile.display_name?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block">{profile.display_name}</span>
                <span className="text-zinc-400">▼</span>
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-20">
                    <div className="p-3 border-b border-zinc-800">
                      <div className="font-medium">{profile.display_name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{profile.email}</div>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>👤</span>
                      <span>My Profile</span>
                    </Link>

                    {profile.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-sm border-t border-zinc-800"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>⚡</span>
                        <span className="text-purple-400 font-medium">Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={async () => {
                        setShowUserMenu(false);
                        await signOut();
                        router.push('/login');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors text-sm border-t border-zinc-800 text-red-400"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="hover:text-red-300">✕</button>
          </div>
        )}

        {/* PLAYERS TAB */}
        {activeTab === "players" && (
          <>
            <PlayerRoster
              players={players}
              newPlayerName={newPlayerName}
              setNewPlayerName={setNewPlayerName}
              onAddPlayer={addPlayer}
              onToggleActive={togglePlayerActive}
              onRemovePlayer={removePlayer}
              onOpenSearch={() => setShowSearchModal(true)}
            />
            
            <PlayerSearchModal
              isOpen={showSearchModal}
              onClose={() => setShowSearchModal(false)}
              onSelect={addPlayerFromUserProfile}
              existingPlayerIds={players.map(p => p.id)}
            />
          </>
        )}

        {/* ROUNDS TAB */}
        {activeTab === "rounds" && (
          <MatchList
            rounds={rounds}
            currentRound={currentRound}
            activePlayersCount={activePlayersCount}
            loading={loading}
            sendingNotify={sendingNotify}
            onGenerateRound={generateRound}
            onSendNotify={sendLineNotification}
            onFinishMatch={openFinishModal}
          />
        )}

        {/* RANKING TAB */}
        {activeTab === "ranking" && (
          <Leaderboard players={players} />
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <SettingsPanel
            courts={courts}
            setCourts={setCourts}
            randomnessLevel={randomnessLevel}
            setRandomnessLevel={setRandomnessLevel}
            lineToken={lineToken}
            setLineToken={setLineToken}
            onSave={updateConfig}
            onResetGame={resetGameOnly}
            onResetAll={resetAll}
          />
        )}
      </main>

      {/* MATCH RESULT MODAL */}
      <MatchResultModal
        match={finishingMatch}
        result={matchResult}
        setResult={setMatchResult}
        onClose={closeFinishModal}
        onSave={saveMatchResult}
      />
    </div>
  );
}

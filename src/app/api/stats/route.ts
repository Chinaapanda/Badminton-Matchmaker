import { getMatchmaker } from "@/lib/matchmaker-instance";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const matchmaker = getMatchmaker();
    const players = matchmaker.getPlayers();
    const playerStats = matchmaker.getPlayerStats();
    const rounds = matchmaker.getRounds();

    // Calculate additional statistics
    const totalGames = rounds.reduce(
      (sum, round) => sum + round.matches.length,
      0
    );
    const averageGamesPerPlayer =
      players.length > 0
        ? players.reduce((sum, player) => sum + player.gamesPlayed, 0) /
          players.length
        : 0;

    const gameDistribution = players.map((player) => ({
      name: player.name,
      gamesPlayed: player.gamesPlayed,
      restRounds: player.restRounds,
    }));

    // Partnership and opposition analysis
    const partnershipCounts: { [pair: string]: number } = {};
    const oppositionCounts: { [pair: string]: number } = {};

    rounds.forEach((round) => {
      round.matches.forEach((match) => {
        // Count partnerships
        const team1Key = [match.team1[0].id, match.team1[1].id]
          .sort()
          .join("-");
        const team2Key = [match.team2[0].id, match.team2[1].id]
          .sort()
          .join("-");

        partnershipCounts[team1Key] = (partnershipCounts[team1Key] || 0) + 1;
        partnershipCounts[team2Key] = (partnershipCounts[team2Key] || 0) + 1;

        // Count oppositions
        match.team1.forEach((p1) => {
          match.team2.forEach((p2) => {
            const oppKey = [p1.id, p2.id].sort().join("-");
            oppositionCounts[oppKey] = (oppositionCounts[oppKey] || 0) + 1;
          });
        });
      });
    });

    return NextResponse.json({
      players,
      playerStats,
      summary: {
        totalPlayers: players.length,
        totalRounds: rounds.length,
        totalGames,
        averageGamesPerPlayer: Math.round(averageGamesPerPlayer * 100) / 100,
      },
      gameDistribution,
      partnershipCounts,
      oppositionCounts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get statistics" },
      { status: 500 }
    );
  }
}

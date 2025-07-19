export interface Player {
  id: string;
  name: string;
  gamesPlayed: number;
  lastPlayedRound: number;
  restRounds: number; // Number of rounds since last played
}

export interface Match {
  court: number;
  team1: [Player, Player];
  team2: [Player, Player];
}

export interface Round {
  roundNumber: number;
  matches: Match[];
  playersPlaying: Player[];
  playersSittingOut: Player[];
}

export interface PartnershipHistory {
  [playerId: string]: Set<string>; // Set of partner IDs
}

export interface OppositionHistory {
  [playerId: string]: Set<string>; // Set of opponent IDs
}

export class BadmintonMatchmaker {
  private players: Map<string, Player> = new Map();
  private currentRound: number = 0;
  private courts: number = 1;
  private partnershipHistory: PartnershipHistory = {};
  private oppositionHistory: OppositionHistory = {};
  private rounds: Round[] = [];

  constructor(courts: number = 1) {
    this.courts = courts;
  }

  updateConfiguration(courts: number): void {
    this.courts = courts;
  }

  addPlayer(name: string): string {
    const id = `player_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const player: Player = {
      id,
      name,
      gamesPlayed: 0,
      lastPlayedRound: -1,
      restRounds: 0,
    };

    this.players.set(id, player);
    this.partnershipHistory[id] = new Set();
    this.oppositionHistory[id] = new Set();

    return id;
  }

  removePlayer(playerId: string): boolean {
    if (this.players.has(playerId)) {
      this.players.delete(playerId);
      delete this.partnershipHistory[playerId];
      delete this.oppositionHistory[playerId];

      // Remove this player from other players' history
      Object.keys(this.partnershipHistory).forEach((key) =>
        this.partnershipHistory[key].delete(playerId)
      );
      Object.keys(this.oppositionHistory).forEach((key) =>
        this.oppositionHistory[key].delete(playerId)
      );

      return true;
    }
    return false;
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  private updateRestRounds(): void {
    this.players.forEach((player) => {
      if (player.lastPlayedRound < this.currentRound - 1) {
        player.restRounds = this.currentRound - player.lastPlayedRound - 1;
      } else {
        player.restRounds = 0;
      }
    });
  }

  private selectPlayersForRound(): { playing: Player[]; sitting: Player[] } {
    const allPlayers = Array.from(this.players.values());

    // Calculate how many players we can actually use based on available courts
    const maxPossibleMatches = Math.floor(allPlayers.length / 4);
    const actualMatches = Math.min(this.courts, maxPossibleMatches);
    const playersPerRound = actualMatches * 4;

    if (allPlayers.length <= playersPerRound) {
      return { playing: allPlayers, sitting: [] };
    }

    // Sort players by priority:
    // 1. Fewer games played (ascending)
    // 2. More rest rounds (descending) - prioritize those who've been sitting
    // 3. Earlier last played round (ascending) - prioritize those who played longer ago
    const sortedPlayers = allPlayers.sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed;
      }
      if (a.restRounds !== b.restRounds) {
        return b.restRounds - a.restRounds;
      }
      return a.lastPlayedRound - b.lastPlayedRound;
    });

    const playing = sortedPlayers.slice(0, playersPerRound);
    const sitting = sortedPlayers.slice(playersPerRound);

    return { playing, sitting };
  }

  private hasPlayedTogether(player1: Player, player2: Player): boolean {
    return this.partnershipHistory[player1.id].has(player2.id);
  }

  private hasPlayedAgainst(player1: Player, player2: Player): boolean {
    return this.oppositionHistory[player1.id].has(player2.id);
  }

  private calculateMatchupScore(
    team1: [Player, Player],
    team2: [Player, Player]
  ): number {
    let score = 0;

    // Penalty for repeated partnerships
    if (this.hasPlayedTogether(team1[0], team1[1])) score += 10;
    if (this.hasPlayedTogether(team2[0], team2[1])) score += 10;

    // Penalty for repeated oppositions
    const oppositions = [
      [team1[0], team2[0]],
      [team1[0], team2[1]],
      [team1[1], team2[0]],
      [team1[1], team2[1]],
    ];

    oppositions.forEach(([p1, p2]) => {
      if (this.hasPlayedAgainst(p1, p2)) score += 5;
    });

    // Penalty for game count imbalance
    const allPlayers = [...team1, ...team2];
    const gameCountVariance = this.calculateVariance(
      allPlayers.map((p) => p.gamesPlayed)
    );
    score += gameCountVariance * 2;

    return score;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length;
  }

  private generateCombinations<T>(arr: T[], r: number): T[][] {
    if (r === 1) return arr.map((item) => [item]);
    if (r > arr.length) return [];

    const result: T[][] = [];
    arr.forEach((item, index) => {
      const rest = arr.slice(index + 1);
      const combinations = this.generateCombinations(rest, r - 1);
      combinations.forEach((combination) => {
        result.push([item, ...combination]);
      });
    });

    return result;
  }

  private findBestMatches(players: Player[]): Match[] {
    if (players.length % 4 !== 0) {
      throw new Error("Number of players must be divisible by 4");
    }

    // Use the configured number of courts, but don't exceed available players
    const maxPossibleMatches = Math.floor(players.length / 4);
    const numMatches = Math.min(this.courts, maxPossibleMatches);
    const matches: Match[] = [];

    // For each court, find the best 4-player combination
    const availablePlayers = [...players];

    for (let court = 0; court < numMatches; court++) {
      let bestMatch: Match | null = null;
      let bestScore = Infinity;

      // Try all possible combinations of 4 players from available
      const fourPlayerCombos = this.generateCombinations(availablePlayers, 4);

      for (const fourPlayers of fourPlayerCombos) {
        // Try all possible team divisions (3 ways to divide 4 players into 2 teams of 2)
        const teamDivisions = [
          [
            [fourPlayers[0], fourPlayers[1]],
            [fourPlayers[2], fourPlayers[3]],
          ],
          [
            [fourPlayers[0], fourPlayers[2]],
            [fourPlayers[1], fourPlayers[3]],
          ],
          [
            [fourPlayers[0], fourPlayers[3]],
            [fourPlayers[1], fourPlayers[2]],
          ],
        ];

        for (const [team1, team2] of teamDivisions) {
          const score = this.calculateMatchupScore(
            team1 as [Player, Player],
            team2 as [Player, Player]
          );

          if (score < bestScore) {
            bestScore = score;
            bestMatch = {
              court: court + 1,
              team1: team1 as [Player, Player],
              team2: team2 as [Player, Player],
            };
          }
        }
      }

      if (bestMatch) {
        matches.push(bestMatch);
        // Remove selected players from available pool
        const selectedPlayerIds = new Set([
          ...bestMatch.team1.map((p) => p.id),
          ...bestMatch.team2.map((p) => p.id),
        ]);

        for (let i = availablePlayers.length - 1; i >= 0; i--) {
          if (selectedPlayerIds.has(availablePlayers[i].id)) {
            availablePlayers.splice(i, 1);
          }
        }
      }
    }

    return matches;
  }

  private updatePlayerStats(matches: Match[]): void {
    matches.forEach((match) => {
      const allPlayers = [...match.team1, ...match.team2];

      allPlayers.forEach((player) => {
        const actualPlayer = this.players.get(player.id);
        if (actualPlayer) {
          actualPlayer.gamesPlayed++;
          actualPlayer.lastPlayedRound = this.currentRound;
          actualPlayer.restRounds = 0;
        }
      });

      // Update partnership history
      this.updatePartnership(match.team1[0], match.team1[1]);
      this.updatePartnership(match.team2[0], match.team2[1]);

      // Update opposition history
      match.team1.forEach((player1) => {
        match.team2.forEach((player2) => {
          this.updateOpposition(player1, player2);
        });
      });
    });
  }

  private updatePartnership(player1: Player, player2: Player): void {
    this.partnershipHistory[player1.id].add(player2.id);
    this.partnershipHistory[player2.id].add(player1.id);
  }

  private updateOpposition(player1: Player, player2: Player): void {
    this.oppositionHistory[player1.id].add(player2.id);
    this.oppositionHistory[player2.id].add(player1.id);
  }

  generateNextRound(): Round | null {
    this.updateRestRounds();

    const { playing, sitting } = this.selectPlayersForRound();

    if (playing.length < 4) {
      throw new Error(
        "Not enough players to form a match. Need at least 4 players."
      );
    }

    // Ensure we have exactly the right number of players for the courts
    const playersToUse = playing.slice(
      0,
      Math.min(playing.length, this.courts * 4)
    );
    const additionalSitting = playing.slice(playersToUse.length);

    const matches = this.findBestMatches(playersToUse);
    this.updatePlayerStats(matches);

    const round: Round = {
      roundNumber: this.currentRound + 1,
      matches,
      playersPlaying: playersToUse,
      playersSittingOut: [...sitting, ...additionalSitting],
    };

    this.rounds.push(round);
    this.currentRound++;

    return round;
  }

  getRounds(): Round[] {
    return [...this.rounds];
  }

  getCurrentRound(): number {
    return this.currentRound;
  }

  getConfiguration(): { courts: number } {
    return {
      courts: this.courts,
    };
  }

  getPlayerStats(): {
    [playerId: string]: {
      gamesPlayed: number;
      partnerships: string[];
      opponents: string[];
    };
  } {
    const stats: {
      [playerId: string]: {
        gamesPlayed: number;
        partnerships: string[];
        opponents: string[];
      };
    } = {};

    this.players.forEach((player, id) => {
      stats[id] = {
        gamesPlayed: player.gamesPlayed,
        partnerships: Array.from(this.partnershipHistory[id] || []),
        opponents: Array.from(this.oppositionHistory[id] || []),
      };
    });

    return stats;
  }

  reset(): void {
    this.currentRound = 0;
    this.rounds = [];
    this.players.forEach((player) => {
      player.gamesPlayed = 0;
      player.lastPlayedRound = -1;
      player.restRounds = 0;
    });

    // Reset history
    Object.keys(this.partnershipHistory).forEach((playerId) => {
      this.partnershipHistory[playerId].clear();
    });
    Object.keys(this.oppositionHistory).forEach((playerId) => {
      this.oppositionHistory[playerId].clear();
    });
  }
}

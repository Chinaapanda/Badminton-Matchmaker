export interface Player {
  id: string;
  name: string;
  gamesPlayed: number;
  lastPlayedRound: number;
  restRounds: number; // Number of rounds since last played
  elo: number;
  wins: number;
  losses: number;
  active: boolean; // Whether the player is present today
}

export interface Match {
  id: string; // Unique ID for the match
  court: number;
  team1: [Player, Player];
  team2: [Player, Player];
  winner?: 1 | 2; // 1 for team1, 2 for team2
  score?: string;
  timestamp?: number;
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
  private randomnessLevel: number = 0.5; // 0 = no randomness, 1 = maximum randomness
  private partnershipHistory: PartnershipHistory = {};
  private oppositionHistory: OppositionHistory = {};
  private rounds: Round[] = [];

  constructor(courts: number = 1, randomnessLevel: number = 0.5) {
    this.courts = courts;
    this.randomnessLevel = Math.max(0, Math.min(1, randomnessLevel)); // Clamp between 0 and 1
    this.loadFromStorage();
  }

  // Add persistence methods
  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      try {
        const data = this.getDataForStorage();
        // console.log("Saving matchmaker data to localStorage", data);
        localStorage.setItem("badminton-matchmaker-data", JSON.stringify(data));
      } catch (error) {
        console.warn("Failed to save matchmaker data:", error);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("badminton-matchmaker-data");
        if (stored) {
          const data = JSON.parse(stored);
          // console.log("Loading matchmaker data from localStorage", data);
          this.loadFromData(data);
        } else {
          console.log("No matchmaker data found in localStorage");
        }
      } catch (error) {
        console.warn("Failed to load matchmaker data:", error);
      }
    }
  }

  // Method to load data from server-side storage
  loadFromServerData(data: any): void {
    this.loadFromData(data);
  }

  // Method to get data for storage (both client and server)
  getDataForStorage(): any {
    return {
      players: Array.from(this.players.entries()),
      currentRound: this.currentRound,
      courts: this.courts,
      randomnessLevel: this.randomnessLevel,
      partnershipHistory: this.serializeSetHistory(this.partnershipHistory),
      oppositionHistory: this.serializeSetHistory(this.oppositionHistory),
      rounds: this.rounds,
    };
  }

  // Helper method to serialize Set objects to arrays for JSON storage
  private serializeSetHistory(history: { [playerId: string]: Set<string> }): {
    [playerId: string]: string[];
  } {
    const serialized: { [playerId: string]: string[] } = {};
    Object.keys(history).forEach((playerId) => {
      serialized[playerId] = Array.from(history[playerId]);
    });
    return serialized;
  }

  // Helper method to deserialize arrays back to Set objects
  private deserializeSetHistory(serialized: { [playerId: string]: string[] }): {
    [playerId: string]: Set<string>;
  } {
    const history: { [playerId: string]: Set<string> } = {};
    Object.keys(serialized).forEach((playerId) => {
      history[playerId] = new Set(serialized[playerId]);
    });
    return history;
  }

  // Private method to load data from any source
  private loadFromData(data: any): void {
    // Restore players
    this.players = new Map(data.players || []);

    // Restore other data
    this.currentRound = data.currentRound || 0;
    this.courts = data.courts || this.courts;
    this.randomnessLevel = data.randomnessLevel || 0.5;

    // Properly restore Set-based histories
    this.partnershipHistory = data.partnershipHistory
      ? this.deserializeSetHistory(data.partnershipHistory)
      : {};
    this.oppositionHistory = data.oppositionHistory
      ? this.deserializeSetHistory(data.oppositionHistory)
      : {};

    this.rounds = data.rounds || [];

    // Ensure all players have history entries and new fields
    this.ensurePlayerIntegrity();
  }

  // Ensure all players have proper Set objects for their histories and new fields
  private ensurePlayerIntegrity(): void {
    this.players.forEach((player, playerId) => {
      if (!this.partnershipHistory[playerId]) {
        this.partnershipHistory[playerId] = new Set();
      }
      if (!this.oppositionHistory[playerId]) {
        this.oppositionHistory[playerId] = new Set();
      }
      // Initialize new fields if missing
      if (player.elo === undefined) player.elo = 1200;
      if (player.wins === undefined) player.wins = 0;
      if (player.losses === undefined) player.losses = 0;
      if (player.active === undefined) player.active = true;
    });
  }

  updateConfiguration(courts: number, randomnessLevel?: number): void {
    this.courts = courts;
    if (randomnessLevel !== undefined) {
      this.randomnessLevel = Math.max(0, Math.min(1, randomnessLevel));
    }
    this.saveToStorage();
  }

  addPlayer(
    name: string,
    options?: {
      id?: string;
      elo?: number;
      wins?: number;
      losses?: number;
    }
  ): string {
    const id =
      options?.id ||
      `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate average games played by existing players for fairness
    const existingPlayers = Array.from(this.players.values());
    const avgGamesPlayed =
      existingPlayers.length > 0
        ? Math.round(
            existingPlayers.reduce((sum, p) => sum + p.gamesPlayed, 0) /
              existingPlayers.length
          )
        : 0;

    const player: Player = {
      id,
      name,
      gamesPlayed: avgGamesPlayed, // Set to average for fairness
      lastPlayedRound: -1,
      restRounds: 0,
      elo: options?.elo ?? 1200,
      wins: options?.wins ?? 0,
      losses: options?.losses ?? 0,
      active: true,
    };

    this.players.set(id, player);
    this.partnershipHistory[id] = new Set();
    this.oppositionHistory[id] = new Set();

    this.saveToStorage();
    return id;
  }

  clearPlayers(): void {
    this.players.clear();
    this.partnershipHistory = {};
    this.oppositionHistory = {};
    this.saveToStorage();
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

      this.saveToStorage();
      return true;
    }
    return false;
  }

  togglePlayerActive(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (player) {
      player.active = !player.active;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  getActivePlayers(): Player[] {
    return Array.from(this.players.values()).filter((p) => p.active);
  }

  private updateRestRounds(): void {
    this.players.forEach((player) => {
      if (player.active) {
        if (player.lastPlayedRound < this.currentRound - 1) {
          player.restRounds = this.currentRound - player.lastPlayedRound - 1;
        } else {
          player.restRounds = 0;
        }
      }
    });
  }

  private selectPlayersForRound(): { playing: Player[]; sitting: Player[] } {
    const activePlayers = this.getActivePlayers();

    // Calculate how many players we can actually use based on available courts
    const maxPossibleMatches = Math.floor(activePlayers.length / 4);
    const actualMatches = Math.min(this.courts, maxPossibleMatches);
    const playersPerRound = actualMatches * 4;

    if (activePlayers.length <= playersPerRound) {
      return { playing: activePlayers, sitting: [] };
    }

    // Sort players by priority with randomization factor:
    // 1. Fewer games played (ascending) - primary factor
    // 2. More rest rounds (descending) - secondary factor
    // 3. Earlier last played round (ascending) - tertiary factor
    // 4. Random factor to break ties and add variety
    const sortedPlayers = activePlayers.sort((a, b) => {
      // Primary: games played
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed;
      }

      // Secondary: rest rounds
      if (a.restRounds !== b.restRounds) {
        return b.restRounds - a.restRounds;
      }

      // Tertiary: last played round
      if (a.lastPlayedRound !== b.lastPlayedRound) {
        return a.lastPlayedRound - b.lastPlayedRound;
      }

      // Random factor to break ties and add variety
      return Math.random() - 0.5;
    });

    // Add additional randomization: shuffle players within the same priority group
    const playing = this.shuffleWithinPriorityGroups(
      sortedPlayers.slice(0, playersPerRound)
    );
    const sitting = sortedPlayers.slice(playersPerRound);

    return { playing, sitting };
  }

  // Helper method to shuffle players within the same priority groups
  private shuffleWithinPriorityGroups(players: Player[]): Player[] {
    if (players.length <= 1) return players;

    const shuffled = [...players];

    // Group players by their priority (games played, rest rounds, last played round)
    const groups: Player[][] = [];
    let currentGroup: Player[] = [];
    let currentPriority = this.getPlayerPriority(shuffled[0]);

    for (const player of shuffled) {
      const priority = this.getPlayerPriority(player);
      if (priority === currentPriority) {
        currentGroup.push(player);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [player];
        currentPriority = priority;
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // Shuffle each group and combine
    const result: Player[] = [];
    for (const group of groups) {
      if (group.length > 1) {
        // Shuffle the group
        for (let i = group.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [group[i], group[j]] = [group[j], group[i]];
        }
      }
      result.push(...group);
    }

    return result;
  }

  // Helper method to get player priority for grouping
  private getPlayerPriority(player: Player): string {
    return `${player.gamesPlayed}-${player.restRounds}-${player.lastPlayedRound}`;
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
    if (this.hasPlayedTogether(team1[0], team1[1])) score += 100; // Increased penalty
    if (this.hasPlayedTogether(team2[0], team2[1])) score += 100;

    // Penalty for repeated oppositions
    const oppositions = [
      [team1[0], team2[0]],
      [team1[0], team2[1]],
      [team1[1], team2[0]],
      [team1[1], team2[1]],
    ];

    oppositions.forEach(([p1, p2]) => {
      if (this.hasPlayedAgainst(p1, p2)) score += 20; // Increased penalty
    });

    // Penalty for game count imbalance
    const allPlayers = [...team1, ...team2];
    const gameCountVariance = this.calculateVariance(
      allPlayers.map((p) => p.gamesPlayed)
    );
    score += gameCountVariance * 10;

    // Penalty for ELO imbalance (fair matches)
    const team1Elo = (team1[0].elo + team1[1].elo) / 2;
    const team2Elo = (team2[0].elo + team2[1].elo) / 2;
    const eloDiff = Math.abs(team1Elo - team2Elo);
    score += eloDiff * 0.1; // Small weight for ELO balance

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

    // Adjust number of attempts based on randomness level
    const baseAttempts = 5;
    const maxAttempts = 20;
    const attempts = Math.floor(
      baseAttempts + this.randomnessLevel * (maxAttempts - baseAttempts)
    );

    let bestOverallMatches: Match[] = [];
    let bestOverallScore = Infinity;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const matches = this.findMatchesWithRandomness(
        players,
        numMatches,
        attempt
      );
      const totalScore = this.calculateTotalMatchScore(matches);

      if (totalScore < bestOverallScore) {
        bestOverallScore = totalScore;
        bestOverallMatches = matches;
      }
    }

    return bestOverallMatches;
  }

  private findMatchesWithRandomness(
    players: Player[],
    numMatches: number,
    attempt: number
  ): Match[] {
    const matches: Match[] = [];
    const availablePlayers = [...players];

    for (let court = 0; court < numMatches; court++) {
      let bestMatch: Match | null = null;
      let bestScore = Infinity;

      // Try all possible combinations of 4 players from available
      const fourPlayerCombos = this.generateCombinations(availablePlayers, 4);

      // Shuffle combinations to add randomness
      this.shuffleArray(fourPlayerCombos);

      // Limit the number of combinations we check to avoid performance issues with large groups
      const combosToCheck = fourPlayerCombos.slice(0, 50);

      for (const fourPlayers of combosToCheck) {
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

        // Shuffle team divisions to add randomness
        this.shuffleArray(teamDivisions);

        for (const [team1, team2] of teamDivisions) {
          // Ensure all 4 players are unique (no duplicates)
          const allPlayers = [...team1, ...team2];
          const playerIds = new Set(allPlayers.map((p) => p.id));
          if (playerIds.size !== 4) {
            // Skip this division if there are duplicate players
            continue;
          }

          const score = this.calculateMatchupScoreWithRandomness(
            team1 as [Player, Player],
            team2 as [Player, Player],
            attempt
          );

          if (score < bestScore) {
            bestScore = score;
            bestMatch = {
              id: `match_${Date.now()}_${court}`,
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

  private calculateMatchupScoreWithRandomness(
    team1: [Player, Player],
    team2: [Player, Player],
    attempt: number
  ): number {
    let score = this.calculateMatchupScore(team1, team2);

    // Add random factor based on randomness level
    // Higher randomness level = more random variation
    const randomFactor =
      (Math.random() - 0.5) * (score * this.randomnessLevel + 1);
    score += randomFactor;

    return score;
  }

  private calculateTotalMatchScore(matches: Match[]): number {
    return matches.reduce((total, match) => {
      return total + this.calculateMatchupScore(match.team1, match.team2);
    }, 0);
  }

  // Helper method to shuffle arrays
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
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
        "Not enough active players to form a match. Need at least 4 players."
      );
    }

    // Ensure we have exactly the right number of players for the courts
    const playersToUse = playing.slice(
      0,
      Math.min(playing.length, this.courts * 4)
    );
    const additionalSitting = playing.slice(playersToUse.length);

    const matches = this.findBestMatches(playersToUse);
    // Player stats (gamesPlayed, lastPlayedRound, restRounds) are updated when matches are recorded.
    // this.updatePlayerStats(matches); // This is now handled by recordMatchResult

    const round: Round = {
      roundNumber: this.currentRound + 1,
      matches,
      playersPlaying: playersToUse,
      playersSittingOut: [...sitting, ...additionalSitting],
    };

    this.rounds.push(round);
    this.currentRound++;

    this.saveToStorage();
    return round;
  }

  getRounds(): Round[] {
    return [...this.rounds];
  }

  getCurrentRound(): number {
    return this.currentRound;
  }

  getConfiguration(): { courts: number; randomnessLevel: number } {
    return {
      courts: this.courts,
      randomnessLevel: this.randomnessLevel,
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
      player.wins = 0;
      player.losses = 0;
      player.elo = 1200;
    });

    // Reset history
    Object.keys(this.partnershipHistory).forEach((playerId) => {
      this.partnershipHistory[playerId].clear();
    });
    Object.keys(this.oppositionHistory).forEach((playerId) => {
      this.oppositionHistory[playerId].clear();
    });
    this.saveToStorage();
  }

  // Reset only game data (rounds and player stats) but keep players
  resetGame(): void {
    // Reset round data
    this.currentRound = 0;
    this.rounds = [];

    // Reset player stats but keep players
    this.players.forEach((player) => {
      player.gamesPlayed = 0;
      player.lastPlayedRound = -1;
      player.restRounds = 0;
      // Optional: Reset ELO/Wins/Losses too? Maybe keep them for long term stats?
      // For now, let's keep ELO/Wins/Losses as "Season Stats" and only reset session stats
    });

    // Reset partnership and opposition history
    this.partnershipHistory = {};
    this.oppositionHistory = {};
    this.ensurePlayerIntegrity();

    this.saveToStorage();
  }

  // Add new method to finish a court and generate new match
  finishCourtAndGenerateNew(courtNumber: number): Round | null {
    // Find the current round
    if (this.rounds.length === 0) {
      throw new Error("No current round to finish");
    }

    const currentRound = this.rounds[this.rounds.length - 1];
    const courtMatchIndex = currentRound.matches.findIndex(
      (match) => match.court === courtNumber
    );

    if (courtMatchIndex === -1) {
      throw new Error(`Court ${courtNumber} not found in current round`);
    }

    const courtMatch = currentRound.matches[courtMatchIndex];

    // If the match hasn't been recorded, we can't finish it this way.
    // The assumption is that `recordMatchResult` would be called first.
    if (!courtMatch.winner) {
      throw new Error(
        `Match on court ${courtNumber} has not been recorded yet. Please record the result first.`
      );
    }

    // Get players who just finished the match (they should be available for new match)
    const justFinishedPlayers = [...courtMatch.team1, ...courtMatch.team2];

    // Remove the finished match from current round
    currentRound.matches.splice(courtMatchIndex, 1);

    // If no more matches in current round, generate next round
    if (currentRound.matches.length === 0) {
      return this.generateNextRound();
    }

    // If there are still matches, generate a new match for this court
    const availablePlayers =
      this.getAvailablePlayersForNewMatch(justFinishedPlayers);

    if (availablePlayers.length >= 4) {
      const newMatch = this.generateSingleMatch(availablePlayers, courtNumber);
      if (newMatch) {
        currentRound.matches.push(newMatch);
        this.saveToStorage();
        return currentRound;
      }
    }

    this.saveToStorage();
    return currentRound;
  }

  // Helper method to get available players for a new match
  private getAvailablePlayersForNewMatch(
    justFinishedPlayers?: Player[]
  ): Player[] {
    const activePlayers = this.getActivePlayers();

    // Get players who are not currently playing in the latest round
    if (this.rounds.length === 0) {
      return activePlayers;
    }

    const currentRound = this.rounds[this.rounds.length - 1];
    const currentlyPlayingIds = new Set(
      currentRound.matches.flatMap((match) => [
        ...match.team1.map((p) => p.id),
        ...match.team2.map((p) => p.id),
      ])
    );

    // Get players who are not currently playing
    const notCurrentlyPlaying = activePlayers.filter(
      (player) => !currentlyPlayingIds.has(player.id)
    );

    // If we have players who just finished, prioritize them for the new match
    if (justFinishedPlayers && justFinishedPlayers.length > 0) {
      // Combine just finished players with other available players
      const justFinishedIds = new Set(justFinishedPlayers.map((p) => p.id));
      const otherAvailablePlayers = notCurrentlyPlaying.filter(
        (p) => !justFinishedIds.has(p.id)
      );

      // Shuffle both groups to add randomness
      this.shuffleArray(justFinishedPlayers);
      this.shuffleArray(otherAvailablePlayers);

      // Return just finished players first, then others
      return [...justFinishedPlayers, ...otherAvailablePlayers];
    }

    return notCurrentlyPlaying;
  }

  // Helper method to generate a single match
  private generateSingleMatch(
    players: Player[],
    courtNumber: number
  ): Match | null {
    if (players.length < 4) return null;

    // Sort players by priority (games played, rest rounds, etc.)
    const sortedPlayers = [...players].sort((a, b) => {
      // First priority: players who have played fewer games
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed;
      }
      // Second priority: players who have been resting longer
      if (a.restRounds !== b.restRounds) {
        return b.restRounds - a.restRounds;
      }
      // Third priority: random
      return Math.random() - 0.5;
    });

    // Take the first 4 players for the match
    const selectedPlayers = sortedPlayers.slice(0, 4);

    // Generate all possible team combinations
    const combinations = this.generateCombinations(selectedPlayers, 2);
    let bestMatch: Match | null = null;
    let bestScore = -Infinity;

    // Try different team combinations
    for (let i = 0; i < combinations.length; i++) {
      for (let j = i + 1; j < combinations.length; j++) {
        const team1 = combinations[i] as [Player, Player];
        const team2 = combinations[j] as [Player, Player];

        // Check if teams are valid (no duplicate players)
        const allPlayers = [...team1, ...team2];
        const playerIds = new Set(allPlayers.map((p) => p.id));
        if (playerIds.size !== 4) continue;

        const score = this.calculateMatchupScore(team1, team2);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            id: `match_${Date.now()}_${courtNumber}`,
            court: courtNumber,
            team1,
            team2,
          };
        }
      }
    }

    return bestMatch;
  }

  recordMatchResult(matchId: string, winner: 1 | 2, score?: string): void {
    // Find match in history
    for (const round of this.rounds) {
      const match = round.matches.find((m) => m.id === matchId);
      if (match) {
        match.winner = winner;
        match.score = score;
        match.timestamp = Date.now(); // Record when the result was set
        this.updatePlayerStats([match]); // Update gamesPlayed, lastPlayedRound, restRounds, partnership, opposition
        this.updateElo(match); // Update ELO, wins, losses
        this.saveToStorage();
        return;
      }
    }
    throw new Error(`Match with ID ${matchId} not found.`);
  }

  private updateElo(match: Match): void {
    if (!match.winner) return;

    const team1 = match.team1;
    const team2 = match.team2;

    const team1AvgElo = (team1[0].elo + team1[1].elo) / 2;
    const team2AvgElo = (team2[0].elo + team2[1].elo) / 2;

    const kFactor = 32; // Standard K-factor

    const expectedScore1 =
      1 / (1 + Math.pow(10, (team2AvgElo - team1AvgElo) / 400));
    const expectedScore2 =
      1 / (1 + Math.pow(10, (team1AvgElo - team2AvgElo) / 400));

    const actualScore1 = match.winner === 1 ? 1 : 0;
    const actualScore2 = match.winner === 2 ? 1 : 0;

    const eloChange1 = Math.round(kFactor * (actualScore1 - expectedScore1));
    const eloChange2 = Math.round(kFactor * (actualScore2 - expectedScore2));

    // Update players
    team1.forEach((p) => {
      const player = this.players.get(p.id);
      if (player) {
        player.elo += eloChange1;
        if (match.winner === 1) player.wins++;
        else player.losses++;
      }
    });

    team2.forEach((p) => {
      const player = this.players.get(p.id);
      if (player) {
        player.elo += eloChange2;
        if (match.winner === 2) player.wins++;
        else player.losses++;
      }
    });
  }
}

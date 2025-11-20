export interface Player {
  id: string;
  name: string;
  gamesPlayed: number;
  lastPlayedRound: number;
  restRounds: number;
  elo: number;
  wins: number;
  losses: number;
  active: boolean;
}

export interface Match {
  id: string;
  court: number;
  team1: [Player, Player];
  team2: [Player, Player];
  winner?: 1 | 2;
  score?: string;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
  playersPlaying: Player[];
  playersSittingOut: Player[];
}

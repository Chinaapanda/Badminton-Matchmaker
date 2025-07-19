# 🏸 Badminton Matchmaker

A web application that generates fair badminton doubles matchups with intelligent player rotation and fairness algorithms.

## Features

### Core Functionality

- **Fair Game Distribution**: Ensures all players play approximately equal number of games
- **Smart Partner/Opponent Rotation**: Minimizes repeated partnerships and oppositions
- **Player Rest Management**: Those who sit out are prioritized for the next round
- **Multiple Courts Support**: Generate 2-3+ games per round simultaneously
- **Flexible Player Count**: Works with any number of players (4+)

### Advanced Algorithm

- **Partnership History Tracking**: Avoids repeated team formations
- **Opposition History Tracking**: Minimizes playing against the same opponents
- **Game Count Balancing**: Prioritizes players with fewer games played
- **Rest Period Optimization**: Players who've been sitting longer get priority

### Web Interface

- **Real-time Player Management**: Add/remove players dynamically
- **Configuration Options**: Set number of courts and maximum rounds
- **Round Generation**: Generate matchups with a single click
- **Round History**: View all previous rounds and matchups
- **Player Statistics**: Track games played and rest periods

## Algorithm Details

The matchmaker uses a sophisticated scoring system to generate optimal matchups:

1. **Player Selection Priority**:

   - Fewer games played (highest priority)
   - More rest rounds (prioritize those sitting longest)
   - Earlier last played round

2. **Matchup Scoring** (lower scores are better):

   - +10 penalty for repeated partnerships
   - +5 penalty for repeated oppositions
   - +2× variance penalty for unbalanced game counts

3. **Combinatorial Optimization**:
   - Tries all possible 4-player combinations
   - Tests all 3 possible team divisions for each group
   - Selects the globally optimal matchups

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Usage Guide

### 1. Configure Settings

- Set the number of courts (1-10)
- Click "Update Config" to apply changes

### 2. Add Players

- Enter player names in the input field
- Need minimum 4 players to generate matches
- Players show their game count and rest rounds

### 3. Generate Rounds

- Click "Generate Round X" to create matchups
- View current round matches with court assignments
- See which players are sitting out (if any)

### 4. Monitor Progress

- Check round history in collapsible sections
- Monitor player statistics and fairness
- Reset system anytime with "Reset All"

## API Endpoints

### Player Management

- `GET /api/players` - Get all players
- `POST /api/players` - Add new player
- `DELETE /api/players` - Remove player

### Round Management

- `GET /api/rounds` - Get all rounds
- `POST /api/rounds` - Generate next round

### Configuration

- `GET /api/config` - Get current configuration
- `POST /api/config` - Update settings or reset

### Statistics

- `GET /api/stats` - Get detailed statistics

## Example Scenarios

### 12 Players, 2 Courts

- 8 players play per round (2 matches)
- 4 players sit out each round
- System rotates sitting players fairly

### 15 Players, 3 Courts

- 12 players play per round (3 matches)
- 3 players sit out each round
- Optimal for continuous play

### 13 Players, 2 Courts

- 8 players play per round
- 5 players sit out
- Those sitting longest get priority next round

## Technical Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Data**: In-memory storage (no database required)
- **Algorithm**: Custom combinatorial optimization

## Architecture

```
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Tailwind styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main UI component
└── lib/
    ├── badminton-matchmaker.ts    # Core algorithm
    └── matchmaker-instance.ts     # Singleton instance
```

## Contributing

The core algorithm is in `src/lib/badminton-matchmaker.ts`. Key areas for enhancement:

- **Algorithm Improvements**: Better optimization strategies
- **UI Enhancements**: Mobile responsiveness, animations
- **Data Persistence**: Database integration for long-term storage
- **Statistics**: Advanced analytics and visualizations

## License

MIT License - feel free to use and modify for your badminton club!

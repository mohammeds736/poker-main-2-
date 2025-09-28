export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
  id: string;
}

export interface PokerChip {
  id: string;
  value: number;
  color: string;
  position: { x: number; y: number };
  playerId: number;
  animated: boolean;
}

export interface HandRanking {
  rank: number;
  name: string;
  cards: Card[];
  kickers: Card[];
}

export interface GameAction {
  type: 'fold' | 'check' | 'call' | 'raise' | 'all-in';
  amount?: number;
  playerId: number;
  timestamp: number;
}

export interface TexasHoldemGame {
  id: string;
  phase: 'waiting' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  pot: number;
  communityCards: Card[];
  players: TexasHoldemPlayer[];
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  currentBet: number;
  minRaise: number;
  actions: GameAction[];
  chips: PokerChip[];
}

export interface TexasHoldemPlayer {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBet: number;
  position: number;
  isActive: boolean;
  hasFolded: boolean;
  isAllIn: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  lastAction?: GameAction;
  handRanking?: HandRanking;
}

export interface PrivateRoom {
  id: string;
  name: string;
  description: string;
  ownerId: number;
  ownerName: string;
  tableDesign: 'classic' | 'modern' | 'luxury';
  maxPlayers: number;
  minBet: number;
  maxBet: number;
  rakePercentage: number;
  totalProfit: number;
  gamesPlayed: number;
  isActive: boolean;
  players: number[];
  createdAt: string;
  password?: string;
}

export interface BiometricVerification {
  faceDetected: boolean;
  faceMatched: boolean;
  confidence: number;
  landmarks: number[][];
  expressions: Record<string, number>;
  verificationSteps: {
    lookLeft: boolean;
    lookRight: boolean;
    lookUp: boolean;
    lookDown: boolean;
    blink: boolean;
  };
}

export interface LiveStream {
  isStreaming: boolean;
  platform: 'facebook' | 'youtube' | 'twitch';
  streamKey?: string;
  viewers: number;
  streamId?: string;
}

export interface AdSystem {
  adsWatched: number;
  freeGamesRemaining: number;
  lastAdWatched: string;
  adProvider: 'google' | 'facebook' | 'unity';
}

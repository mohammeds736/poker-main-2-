export interface GameRoom {
  id: string;
  name: string;
  description: string;
  minBet: number;
  maxBet: number;
  players: string;
  color: string;
  icon: string;
  difficulty: string;
}

export interface CoinPackage {
  id: number;
  amount: number;
  price?: number;
  value?: number;
  color: string;
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  country: string;
  idType: string;
  idNumber: string;
  isVerified: boolean;
  coins: number;
  language?: string;
  profileImage?: string;
  createdAt: string;
}

export interface GamePlayer extends User {
  isBot: boolean;
  position: number;
  name?: string;
  avatar?: string;
}

export interface ChatMessage {
  id: number;
  player: string;
  message: string;
  timestamp: string;
}

import { Card, HandRanking, TexasHoldemPlayer } from '@/types/poker';

export function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Card['rank'][] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  
  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

export function getCardValue(rank: Card['rank']): number {
  switch (rank) {
    case '2': return 2;
    case '3': return 3;
    case '4': return 4;
    case '5': return 5;
    case '6': return 6;
    case '7': return 7;
    case '8': return 8;
    case '9': return 9;
    case '10': return 10;
    case 'J': return 11;
    case 'Q': return 12;
    case 'K': return 13;
    case 'A': return 14;
    default: return 0;
  }
}

export function getBestHand(cards: Card[]): HandRanking {
  if (cards.length < 5) {
    return { name: 'High Card', rank: 1, cards: cards.slice(0, 5) };
  }

  // Generate all possible 5-card combinations
  const combinations = getCombinations(cards, 5);
  let bestHand: HandRanking = { name: 'High Card', rank: 1, cards: [] };

  for (const combo of combinations) {
    const hand = evaluateHand(combo);
    if (hand.rank > bestHand.rank || 
        (hand.rank === bestHand.rank && compareHighCards(hand.cards, bestHand.cards) > 0)) {
      bestHand = hand;
    }
  }

  return bestHand;
}

function getCombinations(arr: Card[], k: number): Card[][] {
  if (k === 1) return arr.map(card => [card]);
  if (k === arr.length) return [arr];
  if (k > arr.length) return [];

  const result: Card[][] = [];
  const [head, ...tail] = arr;
  
  // Include head
  const withHead = getCombinations(tail, k - 1);
  withHead.forEach(combo => result.push([head, ...combo]));
  
  // Exclude head
  const withoutHead = getCombinations(tail, k);
  result.push(...withoutHead);
  
  return result;
}

export function evaluateHand(cards: Card[]): HandRanking {
  if (cards.length !== 5) {
    return { name: 'Invalid Hand', rank: 0, cards };
  }

  const sortedCards = [...cards].sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank));
  const ranks = sortedCards.map(card => getCardValue(card.rank));
  const suits = sortedCards.map(card => card.suit);
  
  const isFlush = suits.every(suit => suit === suits[0]);
  const isStraight = checkStraight(ranks);
  
  // Count occurrences of each rank
  const rankCounts: { [key: number]: number } = {};
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const uniqueRanks = Object.keys(rankCounts).map(Number).sort((a, b) => b - a);

  // Royal Flush (A, K, Q, J, 10 of same suit)
  if (isFlush && isStraight && ranks[0] === 14) {
    return { name: 'Royal Flush', rank: 10, cards: sortedCards };
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return { name: 'Straight Flush', rank: 9, cards: sortedCards };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    return { name: 'Four of a Kind', rank: 8, cards: sortedCards };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return { name: 'Full House', rank: 7, cards: sortedCards };
  }

  // Flush
  if (isFlush) {
    return { name: 'Flush', rank: 6, cards: sortedCards };
  }

  // Straight
  if (isStraight) {
    return { name: 'Straight', rank: 5, cards: sortedCards };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    return { name: 'Three of a Kind', rank: 4, cards: sortedCards };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return { name: 'Two Pair', rank: 3, cards: sortedCards };
  }

  // One Pair
  if (counts[0] === 2) {
    return { name: 'One Pair', rank: 2, cards: sortedCards };
  }

  // High Card
  return { name: 'High Card', rank: 1, cards: sortedCards };
}

function checkStraight(ranks: number[]): boolean {
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
  
  if (uniqueRanks.length !== 5) return false;
  
  // Check for regular straight
  for (let i = 0; i < 4; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 1] !== 1) {
      break;
    }
    if (i === 3) return true;
  }
  
  // Check for A-2-3-4-5 straight (wheel)
  if (uniqueRanks[0] === 14 && uniqueRanks[1] === 5 && uniqueRanks[2] === 4 && 
      uniqueRanks[3] === 3 && uniqueRanks[4] === 2) {
    return true;
  }
  
  return false;
}

function compareHighCards(cards1: Card[], cards2: Card[]): number {
  const values1 = cards1.map(card => getCardValue(card.rank)).sort((a, b) => b - a);
  const values2 = cards2.map(card => getCardValue(card.rank)).sort((a, b) => b - a);
  
  for (let i = 0; i < Math.min(values1.length, values2.length); i++) {
    if (values1[i] > values2[i]) return 1;
    if (values1[i] < values2[i]) return -1;
  }
  
  return 0;
}

export function determineWinners(players: TexasHoldemPlayer[], communityCards: Card[]): TexasHoldemPlayer[] {
  const activePlayers = players.filter(p => p.isActive && !p.hasFolded);
  
  if (activePlayers.length === 0) return [];
  if (activePlayers.length === 1) return activePlayers;

  // Evaluate each player's best hand
  const playerHands = activePlayers.map(player => {
    const allCards = [...player.holeCards, ...communityCards];
    const bestHand = getBestHand(allCards);
    return {
      player,
      hand: bestHand
    };
  });

  // Sort by hand strength (highest first)
  playerHands.sort((a, b) => {
    if (a.hand.rank !== b.hand.rank) {
      return b.hand.rank - a.hand.rank;
    }
    return compareHighCards(b.hand.cards, a.hand.cards);
  });

  // Find all players with the best hand
  const bestHandRank = playerHands[0].hand.rank;
  const winners = playerHands.filter(ph => {
    return ph.hand.rank === bestHandRank && 
           compareHighCards(ph.hand.cards, playerHands[0].hand.cards) === 0;
  });

  // Update player hand rankings for display
  winners.forEach(winner => {
    winner.player.handRanking = winner.hand;
  });

  return winners.map(w => w.player);
}

export function getHandDescription(hand: HandRanking): string {
  switch (hand.name) {
    case 'Royal Flush':
      return 'A, K, Q, J, 10 of the same suit';
    case 'Straight Flush':
      return 'Five cards in sequence, all of the same suit';
    case 'Four of a Kind':
      return 'Four cards of the same rank';
    case 'Full House':
      return 'Three of a kind plus a pair';
    case 'Flush':
      return 'Five cards of the same suit';
    case 'Straight':
      return 'Five cards in sequence';
    case 'Three of a Kind':
      return 'Three cards of the same rank';
    case 'Two Pair':
      return 'Two different pairs';
    case 'One Pair':
      return 'Two cards of the same rank';
    case 'High Card':
      return 'No matching cards';
    default:
      return 'Unknown hand';
  }
}

export function formatCards(cards: Card[]): string {
  return cards.map(card => {
    const suitSymbol = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    }[card.suit];
    return `${card.rank}${suitSymbol}`;
  }).join(' ');
}

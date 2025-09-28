import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User } from '@/types/user';
import { TexasHoldemGame, TexasHoldemPlayer, Card as PlayingCard, GameAction, PokerChip } from '@/types/poker';
import { createDeck, evaluateHand, determineWinners, getBestHand } from '@/utils/pokerLogic';
import PokerChipComponent, { BettingAnimation } from '@/components/PokerChip';
import ChatSystem from '@/components/ChatSystem';
import LiveStreamControls from '@/components/LiveStreamControls';

interface RoomConfig {
  name: string;
  minBet: number;
  maxBet: number;
  color: string;
  smallBlind: number;
  bigBlind: number;
}

const roomConfigs: Record<string, RoomConfig> = {
  'beginner': { name: 'Beginner Room', minBet: 10, maxBet: 100, color: 'from-green-600 to-green-800', smallBlind: 5, bigBlind: 10 },
  'intermediate': { name: 'Intermediate Room', minBet: 50, maxBet: 500, color: 'from-blue-600 to-blue-800', smallBlind: 25, bigBlind: 50 },
  'professional': { name: 'Professional Room', minBet: 200, maxBet: 2000, color: 'from-purple-600 to-purple-800', smallBlind: 100, bigBlind: 200 },
  'kings': { name: 'Kings Room', minBet: 1000, maxBet: 10000, color: 'from-yellow-600 to-yellow-800', smallBlind: 500, bigBlind: 1000 },
  'practice-easy': { name: 'Practice Easy', minBet: 0, maxBet: 0, color: 'from-gray-600 to-gray-800', smallBlind: 0, bigBlind: 0 },
  'practice-medium': { name: 'Practice Medium', minBet: 0, maxBet: 0, color: 'from-orange-600 to-orange-800', smallBlind: 0, bigBlind: 0 }
};

const botPlayers: TexasHoldemPlayer[] = [
  { id: 2, name: 'Alex Bot', avatar: '🤖', chips: 5000, holeCards: [], currentBet: 0, totalBet: 0, position: 1, isActive: true, hasFolded: false, isAllIn: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { id: 3, name: 'Sarah Bot', avatar: '🤖', chips: 3000, holeCards: [], currentBet: 0, totalBet: 0, position: 2, isActive: true, hasFolded: false, isAllIn: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { id: 4, name: 'Mike Bot', avatar: '🤖', chips: 4000, holeCards: [], currentBet: 0, totalBet: 0, position: 3, isActive: true, hasFolded: false, isAllIn: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { id: 5, name: 'Lisa Bot', avatar: '🤖', chips: 2500, holeCards: [], currentBet: 0, totalBet: 0, position: 4, isActive: true, hasFolded: false, isAllIn: false, isDealer: false, isSmallBlind: false, isBigBlind: false },
  { id: 6, name: 'John Bot', avatar: '🤖', chips: 3500, holeCards: [], currentBet: 0, totalBet: 0, position: 5, isActive: true, hasFolded: false, isAllIn: false, isDealer: false, isSmallBlind: false, isBigBlind: false }
];

export default function EnhancedPokerTable() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [game, setGame] = useState<TexasHoldemGame | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [bettingAnimations, setBettingAnimations] = useState<Array<{id: string, fromPosition: {x: number, y: number}, toPosition: {x: number, y: number}, chips: PokerChip[]}>>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const roomConfig = roomId ? roomConfigs[roomId] : null;

  useEffect(() => {
    const userData = localStorage.getItem('poker_user');
    if (userData) {
      const parsedUser: User = JSON.parse(userData);
      setUser(parsedUser);
      initializeGame(parsedUser);
    } else {
      navigate('/login');
    }
  }, [navigate, roomId]);

  const initializeGame = (currentUser: User) => {
    const deck = createDeck();
    
    // Create user player
    const userPlayer: TexasHoldemPlayer = {
      id: currentUser.id,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
      avatar: '👤',
      chips: currentUser.coins,
      holeCards: [],
      currentBet: 0,
      totalBet: 0,
      position: 0,
      isActive: true,
      hasFolded: false,
      isAllIn: false,
      isDealer: true,
      isSmallBlind: false,
      isBigBlind: false
    };

    // Set up blinds
    const players = [userPlayer, ...botPlayers.slice(0, 5)];
    const smallBlindIndex = 1;
    const bigBlindIndex = 2;
    
    players[smallBlindIndex].isSmallBlind = true;
    players[bigBlindIndex].isBigBlind = true;

    const smallBlind = roomConfig?.smallBlind || 5;
    const bigBlind = roomConfig?.bigBlind || 10;

    // Deduct blinds
    players[smallBlindIndex].currentBet = smallBlind;
    players[smallBlindIndex].totalBet = smallBlind;
    players[smallBlindIndex].chips -= smallBlind;

    players[bigBlindIndex].currentBet = bigBlind;
    players[bigBlindIndex].totalBet = bigBlind;
    players[bigBlindIndex].chips -= bigBlind;

    const newGame: TexasHoldemGame = {
      id: `game_${Date.now()}`,
      phase: 'pre-flop',
      pot: smallBlind + bigBlind,
      communityCards: [],
      players,
      currentPlayerIndex: 3, // Start after big blind
      dealerIndex: 0,
      smallBlindIndex,
      bigBlindIndex,
      currentBet: bigBlind,
      minRaise: bigBlind,
      actions: [],
      chips: []
    };

    // Deal hole cards
    dealHoleCards(newGame, deck);
    setGame(newGame);
    setIsPlayerTurn(newGame.currentPlayerIndex === 0);
  };

  const dealHoleCards = (game: TexasHoldemGame, deck: PlayingCard[]) => {
    const shuffledDeck = [...deck];
    let cardIndex = 0;

    // Deal 2 cards to each player
    for (let round = 0; round < 2; round++) {
      for (const player of game.players) {
        if (player.isActive && cardIndex < shuffledDeck.length) {
          player.holeCards.push(shuffledDeck[cardIndex]);
          cardIndex++;
        }
      }
    }

    // Set remaining deck for community cards
    game.communityCards = shuffledDeck.slice(cardIndex, cardIndex + 5);
  };

  const getPlayerPosition = (playerIndex: number) => {
    const angle = (playerIndex * 60) - 90;
    const x = Math.cos(angle * Math.PI / 180) * 250;
    const y = Math.sin(angle * Math.PI / 180) * 150;
    return { x: x + 500, y: y + 250 }; // Larger table center
  };

  const getPotPosition = () => ({ x: 500, y: 250 });

  const animateBetting = (playerIndex: number, chipValue: number) => {
    const fromPosition = getPlayerPosition(playerIndex);
    const toPosition = getPotPosition();
    
    const chips: PokerChip[] = [{
      id: `chip_${Date.now()}`,
      value: chipValue,
      color: 'yellow',
      position: fromPosition,
      playerId: game?.players[playerIndex].id || 0,
      animated: true
    }];

    const animation = {
      id: `animation_${Date.now()}`,
      fromPosition,
      toPosition,
      chips
    };

    setBettingAnimations(prev => [...prev, animation]);

    // Remove animation after completion
    setTimeout(() => {
      setBettingAnimations(prev => prev.filter(a => a.id !== animation.id));
    }, 1000);
  };

  const playerAction = (action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => {
    if (!game || !user || !isPlayerTurn) return;

    const currentPlayer = game.players[game.currentPlayerIndex];
    const actionAmount = amount || 0;

    // Create action
    const gameAction: GameAction = {
      type: action,
      amount: actionAmount,
      playerId: currentPlayer.id,
      timestamp: Date.now()
    };

    // Process action
    let updatedGame = { ...game };
    
    switch (action) {
      case 'fold': {
        currentPlayer.hasFolded = true;
        currentPlayer.isActive = false;
        break;
      }
      case 'check': {
        // Can only check if no bet to call
        if (game.currentBet > currentPlayer.currentBet) {
          toast.error('Cannot check, must call or fold');
          return;
        }
        break;
      }
      case 'call': {
        const callAmount = game.currentBet - currentPlayer.currentBet;
        if (currentPlayer.chips < callAmount) {
          toast.error('Insufficient chips to call');
          return;
        }
        currentPlayer.chips -= callAmount;
        currentPlayer.currentBet = game.currentBet;
        currentPlayer.totalBet += callAmount;
        updatedGame.pot += callAmount;
        animateBetting(game.currentPlayerIndex, callAmount);
        break;
      }
      case 'raise': {
        const raiseAmount = actionAmount;
        const totalToCall = game.currentBet - currentPlayer.currentBet + raiseAmount;
        
        if (currentPlayer.chips < totalToCall) {
          toast.error('Insufficient chips to raise');
          return;
        }
        
        if (raiseAmount < game.minRaise) {
          toast.error(`Minimum raise is ${game.minRaise}`);
          return;
        }
        
        currentPlayer.chips -= totalToCall;
        currentPlayer.currentBet = game.currentBet + raiseAmount;
        currentPlayer.totalBet += totalToCall;
        updatedGame.pot += totalToCall;
        updatedGame.currentBet = currentPlayer.currentBet;
        updatedGame.minRaise = raiseAmount;
        animateBetting(game.currentPlayerIndex, totalToCall);
        break;
      }
    }

    // Add action to history
    updatedGame.actions.push(gameAction);
    
    // Move to next player
    moveToNextPlayer(updatedGame);
    
    // Update user coins if it's the user
    if (currentPlayer.id === user.id) {
      const updatedUser = { ...user, coins: currentPlayer.chips };
      setUser(updatedUser);
      localStorage.setItem('poker_user', JSON.stringify(updatedUser));
    }

    setGame(updatedGame);
    setBetAmount('');
  };

  const moveToNextPlayer = (game: TexasHoldemGame) => {
    let nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    let attempts = 0;
    
    // Find next active player
    while (attempts < game.players.length) {
      const nextPlayer = game.players[nextPlayerIndex];
      if (nextPlayer.isActive && !nextPlayer.hasFolded) {
        game.currentPlayerIndex = nextPlayerIndex;
        setIsPlayerTurn(nextPlayerIndex === 0);
        
        // If it's a bot's turn, simulate bot action
        if (nextPlayerIndex !== 0) {
          setTimeout(() => simulateBotAction(game, nextPlayerIndex), 1500);
        }
        return;
      }
      nextPlayerIndex = (nextPlayerIndex + 1) % game.players.length;
      attempts++;
    }
    
    // If we get here, betting round is complete
    advanceGamePhase(game);
  };

  const simulateBotAction = (game: TexasHoldemGame, botIndex: number) => {
    const bot = game.players[botIndex];
    const callAmount = game.currentBet - bot.currentBet;
    
    // Simple bot AI
    const random = Math.random();
    let action: 'fold' | 'check' | 'call' | 'raise' = 'fold';
    let amount = 0;
    
    if (callAmount === 0) {
      // No bet to call
      action = random > 0.3 ? 'check' : 'raise';
      if (action === 'raise') {
        amount = game.minRaise;
      }
    } else {
      // There's a bet to call
      if (random > 0.7) {
        action = 'fold';
      } else if (random > 0.4) {
        action = 'call';
      } else {
        action = 'raise';
        amount = game.minRaise;
      }
    }
    
    // Check if bot has enough chips
    if ((action === 'call' && bot.chips < callAmount) ||
        (action === 'raise' && bot.chips < callAmount + amount)) {
      action = bot.chips > callAmount ? 'call' : 'fold';
      amount = 0;
    }
    
    // Execute bot action
    setTimeout(() => {
      playerAction(action, amount);
      toast.info(`${bot.name} ${action}s${amount > 0 ? ` ${amount}` : ''}`);
    }, 500);
  };

  const advanceGamePhase = (game: TexasHoldemGame) => {
    // Reset current bets for next round
    game.players.forEach(player => {
      player.currentBet = 0;
    });
    
    game.currentBet = 0;
    game.minRaise = roomConfig?.bigBlind || 10;
    
    switch (game.phase) {
      case 'pre-flop': {
        game.phase = 'flop';
        toast.success('Flop revealed!');
        break;
      }
      case 'flop': {
        game.phase = 'turn';
        toast.success('Turn card revealed!');
        break;
      }
      case 'turn': {
        game.phase = 'river';
        toast.success('River card revealed!');
        break;
      }
      case 'river': {
        game.phase = 'showdown';
        determineWinner(game);
        return;
      }
    }
    
    // Start next betting round with first active player after dealer
    let nextPlayerIndex = (game.dealerIndex + 1) % game.players.length;
    while (!game.players[nextPlayerIndex].isActive || game.players[nextPlayerIndex].hasFolded) {
      nextPlayerIndex = (nextPlayerIndex + 1) % game.players.length;
    }
    
    game.currentPlayerIndex = nextPlayerIndex;
    setIsPlayerTurn(nextPlayerIndex === 0);
    
    if (nextPlayerIndex !== 0) {
      setTimeout(() => simulateBotAction(game, nextPlayerIndex), 1500);
    }
  };

  const determineWinner = (game: TexasHoldemGame) => {
    const activePlayers = game.players.filter(p => p.isActive && !p.hasFolded);
    
    if (activePlayers.length === 1) {
      // Only one player left
      const winner = activePlayers[0];
      winner.chips += game.pot;
      toast.success(`${winner.name} wins ${game.pot} chips!`);
    } else {
      // Evaluate hands
      const winners = determineWinners(activePlayers, game.communityCards.slice(0, 5));
      const winAmount = Math.floor(game.pot / winners.length);
      
      winners.forEach(winner => {
        winner.chips += winAmount;
      });
      
      if (winners.length === 1) {
        toast.success(`${winners[0].name} wins with ${winners[0].handRanking?.name}! Pot: ${game.pot} chips`);
      } else {
        toast.success(`Split pot between ${winners.map(w => w.name).join(', ')} - ${winAmount} chips each`);
      }
    }
    
    game.phase = 'finished';
    
    // Update user coins if user won
    const userPlayer = game.players.find(p => p.id === user?.id);
    if (userPlayer && user) {
      const updatedUser = { ...user, coins: userPlayer.chips };
      setUser(updatedUser);
      localStorage.setItem('poker_user', JSON.stringify(updatedUser));
    }
  };

  const resetGame = () => {
    if (user) {
      initializeGame(user);
    }
  };

  const getCommunityCardsToShow = () => {
    if (!game) return [];
    
    switch (game.phase) {
      case 'pre-flop':
        return [];
      case 'flop':
        return game.communityCards.slice(0, 3);
      case 'turn':
        return game.communityCards.slice(0, 4);
      case 'river':
      case 'showdown':
      case 'finished':
        return game.communityCards.slice(0, 5);
      default:
        return [];
    }
  };

  const renderCard = (card: PlayingCard, isHidden = false) => {
    if (isHidden) {
      return (
        <div className="w-16 h-24 bg-blue-800 border-2 border-blue-600 rounded flex items-center justify-center text-white text-sm">
          🂠
        </div>
      );
    }
    
    const suitColor = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-black';
    const suitSymbol = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    }[card.suit];
    
    return (
      <div className="w-16 h-24 bg-white border-2 border-gray-300 rounded flex flex-col items-center justify-center text-sm font-bold shadow-lg">
        <div className={suitColor}>{card.rank}</div>
        <div className={`${suitColor} text-lg`}>{suitSymbol}</div>
      </div>
    );
  };

  if (!game || !user || !roomConfig) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-xl animate-bounce opacity-5 text-yellow-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: '4s'
            }}
          >
            {['♠', '♥', '♦', '♣', '🃏'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{roomConfig.name}</h1>
            <p className="text-gray-300">
              Phase: {game.phase.toUpperCase()} | Pot: {game.pot} 🪙 | Current Bet: {game.currentBet} 🪙
            </p>
          </div>
          <div className="flex space-x-4">
            <Badge className="bg-yellow-600 text-lg px-4 py-2">
              Balance: {user.coins} 🪙
            </Badge>
            <LiveStreamControls />
            <Button
              onClick={() => navigate('/game-rooms')}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              Leave Table
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area - Larger Table */}
          <div className="lg:col-span-3">
            {/* Poker Table - Increased Size */}
            <div className="relative" ref={tableRef}>
              {/* Table - Much Larger */}
              <div className={`bg-gradient-to-br ${roomConfig.color} rounded-full w-full h-[600px] relative shadow-2xl border-8 border-yellow-300`}>
                {/* Table surface */}
                <div className="absolute inset-6 bg-green-800 rounded-full border-4 border-green-700 flex items-center justify-center">
                  {/* Center area with logo and community cards */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-4 animate-pulse">
                      👑 JAAFAR ALSAYED POKER 👑
                    </div>
                    <div className="text-2xl text-yellow-300 mb-6">POT: {game.pot} 🪙</div>
                    
                    {/* Community Cards - Larger */}
                    <div className="flex space-x-3 justify-center mb-4">
                      {getCommunityCardsToShow().map((card, index) => (
                        <div key={index}>
                          {renderCard(card)}
                        </div>
                      ))}
                      {Array.from({ length: 5 - getCommunityCardsToShow().length }).map((_, index) => (
                        <div key={`empty-${index}`} className="w-16 h-24 bg-gray-600 rounded border-2 border-gray-500 flex items-center justify-center text-lg">
                          🂠
                        </div>
                      ))}
                    </div>
                    
                    {/* Phase Indicator */}
                    <Badge className="bg-purple-600 text-lg px-4 py-2">
                      {game.phase.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Player positions around the table - Larger spacing */}
                {game.players.map((player, index) => {
                  const angle = (index * 60) - 90;
                  const x = Math.cos(angle * Math.PI / 180) * 220;
                  const y = Math.sin(angle * Math.PI / 180) * 160;
                  
                  return (
                    <div
                      key={player.id}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${x}px - 60px)`,
                        top: `calc(50% + ${y}px - 80px)`,
                      }}
                    >
                      {/* Player info */}
                      <div className="text-center mb-3">
                        <div className={`w-20 h-20 rounded-full border-4 ${
                          game.currentPlayerIndex === index ? 'border-yellow-400 bg-yellow-600 animate-pulse' :
                          player.hasFolded ? 'border-red-400 bg-red-600' :
                          player.id === user.id ? 'border-green-400 bg-green-600' : 'border-blue-400 bg-blue-600'
                        } flex items-center justify-center text-3xl`}>
                          {player.avatar}
                        </div>
                        <div className="text-white text-base font-bold mt-2">{player.name}</div>
                        <div className="text-yellow-400 text-sm">{player.chips} 🪙</div>
                        {player.currentBet > 0 && (
                          <div className="text-green-400 text-sm">Bet: {player.currentBet}</div>
                        )}
                        <div className="flex justify-center space-x-1 mt-1">
                          {player.isDealer && <Badge className="text-xs bg-yellow-600">D</Badge>}
                          {player.isSmallBlind && <Badge className="text-xs bg-blue-600">SB</Badge>}
                          {player.isBigBlind && <Badge className="text-xs bg-red-600">BB</Badge>}
                        </div>
                      </div>
                      
                      {/* Player cards - Larger */}
                      <div className="flex space-x-2 justify-center">
                        {player.holeCards.map((card, cardIndex) => (
                          <div key={cardIndex}>
                            {renderCard(card, player.id !== user.id && game.phase !== 'showdown')}
                          </div>
                        ))}
                      </div>
                      
                      {/* Betting chips visualization */}
                      {player.currentBet > 0 && (
                        <div className="flex justify-center mt-2">
                          <div className="bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-black">
                            {player.currentBet}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Betting Animations */}
              {bettingAnimations.map((animation) => (
                <BettingAnimation
                  key={animation.id}
                  fromPosition={animation.fromPosition}
                  toPosition={animation.toPosition}
                  chips={animation.chips}
                  onComplete={() => {}}
                />
              ))}
            </div>

            {/* Game Controls */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
              <CardContent className="p-6">
                {game.phase === 'finished' ? (
                  <div className="text-center">
                    <Button
                      onClick={resetGame}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg px-8 py-3"
                    >
                      🎴 New Game
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isPlayerTurn && (
                      <div className="text-center mb-4">
                        <Badge className="bg-yellow-600 text-xl px-6 py-3 animate-pulse">
                          Your Turn!
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4 items-center justify-center">
                      <Button
                        onClick={() => playerAction('fold')}
                        disabled={!isPlayerTurn || game.phase === 'finished'}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-lg px-6 py-3"
                      >
                        🚫 Fold
                      </Button>
                      
                      {game.currentBet === game.players[game.currentPlayerIndex]?.currentBet ? (
                        <Button
                          onClick={() => playerAction('check')}
                          disabled={!isPlayerTurn || game.phase === 'finished'}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg px-6 py-3"
                        >
                          ✓ Check
                        </Button>
                      ) : (
                        <Button
                          onClick={() => playerAction('call')}
                          disabled={!isPlayerTurn || game.phase === 'finished'}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg px-6 py-3"
                        >
                          📞 Call {game.currentBet - (game.players[game.currentPlayerIndex]?.currentBet || 0)}
                        </Button>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Raise amount"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="w-40 bg-white/10 border-white/20 text-white text-lg"
                          min={game.minRaise}
                          max={roomConfig.maxBet}
                        />
                        <Button
                          onClick={() => playerAction('raise', parseInt(betAmount))}
                          disabled={!isPlayerTurn || !betAmount || game.phase === 'finished'}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-lg px-6 py-3"
                        >
                          📈 Raise
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar with Hide Button */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Communication</h3>
              <Button
                onClick={() => setShowChat(!showChat)}
                variant="outline"
                size="sm"
                className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
              >
                {showChat ? '👁️ Hide Chat' : '👁️‍🗨️ Show Chat'}
              </Button>
            </div>
            
            {showChat && (
              <ChatSystem 
                roomId={roomId || 'default'}
                currentUser={user}
                showChat={showChat}
                onToggleChat={() => setShowChat(!showChat)}
              />
            )}

            {/* Game Status */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-4">
              <CardContent className="p-4">
                <h3 className="text-white font-bold mb-2">🎮 Game Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Phase:</span>
                    <span className="text-white capitalize">{game.phase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Current Bet:</span>
                    <span className="text-yellow-400">{game.currentBet} 🪙</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Min Raise:</span>
                    <span className="text-white">{game.minRaise} 🪙</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Active Players:</span>
                    <span className="text-white">{game.players.filter(p => p.isActive && !p.hasFolded).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

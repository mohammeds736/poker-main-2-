import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/user';
import { GameRoom } from '@/types/game';

const gameRooms: GameRoom[] = [
  {
    id: 'beginner',
    name: 'Beginner Room',
    description: 'Perfect for new players learning the game',
    minBet: 10,
    maxBet: 100,
    players: '2-6',
    color: 'from-green-500 to-green-700',
    icon: '🌱',
    difficulty: 'Easy'
  },
  {
    id: 'intermediate',
    name: 'Intermediate Room',
    description: 'For players with some experience',
    minBet: 50,
    maxBet: 500,
    players: '2-6',
    color: 'from-blue-500 to-blue-700',
    icon: '⚡',
    difficulty: 'Medium'
  },
  {
    id: 'professional',
    name: 'Professional Room',
    description: 'High-stakes games for experienced players',
    minBet: 200,
    maxBet: 2000,
    players: '2-6',
    color: 'from-purple-500 to-purple-700',
    icon: '🎯',
    difficulty: 'Hard'
  },
  {
    id: 'kings',
    name: 'Kings Room',
    description: 'Elite room for poker masters only',
    minBet: 1000,
    maxBet: 10000,
    players: '2-6',
    color: 'from-yellow-500 to-yellow-700',
    icon: '👑',
    difficulty: 'Expert'
  }
];

const practiceRooms: GameRoom[] = [
  {
    id: 'practice-easy',
    name: 'Practice vs Easy Bots',
    description: 'Learn the basics with friendly AI opponents',
    minBet: 0,
    maxBet: 0,
    players: '1+5 Bots',
    color: 'from-gray-500 to-gray-700',
    icon: '🤖',
    difficulty: 'Practice'
  },
  {
    id: 'practice-medium',
    name: 'Practice vs Medium Bots',
    description: 'Improve your skills with challenging AI',
    minBet: 0,
    maxBet: 0,
    players: '1+5 Bots',
    color: 'from-orange-500 to-orange-700',
    icon: '🤖',
    difficulty: 'Practice'
  }
];

export default function GameRooms() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('poker_user');
    if (userData) {
      setUser(JSON.parse(userData) as User);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const canJoinRoom = (room: GameRoom) => {
    if (room.minBet === 0) return true; // Practice rooms
    return user && user.coins >= room.minBet * 10; // Need at least 10x min bet
  };

  const joinRoom = (roomId: string) => {
    const room = [...gameRooms, ...practiceRooms].find(r => r.id === roomId);
    if (!room) return;

    if (!canJoinRoom(room)) {
      alert(`You need at least ${room.minBet * 10} coins to join this room.`);
      return;
    }

    // Play sound effect (simulated)
    console.log('🔊 Room join sound effect');
    
    // Navigate to poker table
    navigate(`/poker-table/${roomId}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-bounce opacity-10 text-yellow-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: '5s'
            }}
          >
            {['🎯', '🎰', '🃏', '♠', '♥', '♦', '♣'][Math.floor(Math.random() * 7)]}
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Game Rooms
            </h1>
            <p className="text-gray-300 mt-2">Choose your skill level and start playing</p>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* User balance */}
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Your Balance</h2>
                <p className="text-2xl font-bold">{user.coins} 🪙</p>
              </div>
              <div className="text-4xl opacity-50">💰</div>
            </div>
          </CardContent>
        </Card>

        {/* Practice Rooms */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            🤖 Practice Rooms
            <Badge className="ml-3 bg-green-600">Free</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {practiceRooms.map((room) => (
              <Card 
                key={room.id}
                className={`bg-gradient-to-br ${room.color} text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300`}
                onClick={() => joinRoom(room.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{room.icon}</div>
                      <div>
                        <CardTitle className="text-xl">{room.name}</CardTitle>
                        <Badge className="bg-white/20">{room.difficulty}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/80 mb-4">
                    {room.description}
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Players:</span>
                      <span>{room.players}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="text-green-300 font-bold">FREE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Real Money Rooms */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            💰 Real Money Rooms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {gameRooms.map((room) => (
              <Card 
                key={room.id}
                className={`bg-gradient-to-br ${room.color} text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 ${
                  !canJoinRoom(room) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => canJoinRoom(room) && joinRoom(room.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl animate-pulse">{room.icon}</div>
                      <div>
                        <CardTitle className="text-xl">{room.name}</CardTitle>
                        <Badge className="bg-white/20">{room.difficulty}</Badge>
                      </div>
                    </div>
                    {room.id === 'professional' && (
                      <Badge className="bg-red-600">Popular</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/80 mb-4">
                    {room.description}
                  </CardDescription>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Min Bet:</span>
                      <span>{room.minBet} 🪙</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Bet:</span>
                      <span>{room.maxBet} 🪙</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Players:</span>
                      <span>{room.players}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Required:</span>
                      <span className={canJoinRoom(room) ? 'text-green-300' : 'text-red-300'}>
                        {room.minBet * 10} 🪙
                      </span>
                    </div>
                  </div>
                  {!canJoinRoom(room) && (
                    <div className="mt-4 text-center">
                      <Badge className="bg-red-600">Insufficient Coins</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* VIP Room Creation (for future implementation) */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                👑 VIP Room Creation
                <Badge className="ml-3 bg-yellow-600">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Create your own exclusive poker rooms, invite players, and earn profits from room activities.
                Available for Kings level players and above.
              </p>
              <Button 
                disabled 
                className="bg-white/20 text-white cursor-not-allowed"
              >
                Feature Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

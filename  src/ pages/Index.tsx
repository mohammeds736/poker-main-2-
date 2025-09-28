import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Floating poker card bubbles component
const FloatingBubbles = () => {
  const bubbleTypes = ['♠', '♥', '♦', '♣', '👑'];
  const [bubbles, setBubbles] = useState<Array<{id: number, type: string, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    const newBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      type: bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute text-4xl animate-bounce opacity-20 text-yellow-400"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: '3s'
          }}
        >
          {bubble.type}
        </div>
      ))}
    </div>
  );
};

// Animated logo component
const AnimatedLogo = () => {
  return (
    <div className="relative flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full blur-xl opacity-75 animate-pulse"></div>
        <div className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
          <h1 className="text-6xl md:text-8xl font-bold text-center animate-spin-slow">
            👑 JAAFAR ALSAYED POKER 👑
          </h1>
        </div>
      </div>
      <div className="flex space-x-2 animate-bounce">
        <span className="text-4xl text-yellow-400">♠</span>
        <span className="text-4xl text-red-500">♥</span>
        <span className="text-4xl text-red-500">♦</span>
        <span className="text-4xl text-yellow-400">♣</span>
      </div>
    </div>
  );
};

export default function Index() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('poker_user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black relative overflow-hidden">
      <FloatingBubbles />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <g fill="#ffffff" fillOpacity="0.05">
              <circle cx="30" cy="30" r="2"/>
            </g>
          </g>
        </svg>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="space-y-12 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <AnimatedLogo />
          
          <div className="space-y-6">
            <p className="text-xl md:text-2xl text-gray-300 animate-in fade-in delay-500 duration-700">
              Experience the Ultimate Online Poker Adventure
            </p>
            <p className="text-lg text-gray-400 animate-in fade-in delay-700 duration-700">
              Join thousands of players in the most exclusive poker rooms with real-time gameplay, 
              professional dealers, and premium features.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in delay-1000 duration-700">
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-8 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              {isAuthenticated ? 'Enter Game' : 'Get Started'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/register')}
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold py-4 px-8 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Create Account
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-in fade-in delay-1200 duration-700">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">Professional Tables</h3>
              <p className="text-gray-300">Experience realistic casino-style poker tables with premium graphics</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-white mb-2">VIP Rooms</h3>
              <p className="text-gray-300">Create and manage exclusive poker rooms with profit sharing</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-white mb-2">Real-time Gaming</h3>
              <p className="text-gray-300">Play with real players or practice with advanced AI bots</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

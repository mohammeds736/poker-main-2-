import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User } from '@/types/user';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      const users: User[] = JSON.parse(localStorage.getItem('poker_users') || '[]');
      const user = users.find((u: User) => u.email === formData.email);

      if (user && user.isVerified) {
        localStorage.setItem('poker_user', JSON.stringify(user));
        toast.success('Login successful! Welcome back to Jaafar Alsayed Poker');
        navigate('/dashboard');
      } else if (user && !user.isVerified) {
        toast.error('Please verify your email first');
        navigate('/verify-email');
      } else {
        toast.error('Invalid credentials');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-6">
      {/* Floating bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-bounce opacity-20 text-yellow-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: '4s'
            }}
          >
            {['♠', '♥', '♦', '♣', '👑'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Animated Logo */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-xl opacity-75 animate-pulse"></div>
            <h1 className="relative text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent animate-pulse">
              👑 JAAFAR ALSAYED POKER 👑
            </h1>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-300">
              Sign in to your poker account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-yellow-400 hover:text-yellow-300 font-semibold"
                >
                  Create Account
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-gray-300"
              >
                ← Back to Home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User } from '@/types/user';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [sentCode, setSentCode] = useState('123456'); // Default verification code

  useEffect(() => {
    const user: User | null = JSON.parse(localStorage.getItem('poker_user') || 'null');
    if (user?.email) {
      setUserEmail(user.email);
      // Simulate sending verification code
      console.log(`Verification code sent to ${user.email}: 123456`);
      toast.info(`Verification code sent to ${user.email}`);
    } else {
      navigate('/register');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate verification process
    setTimeout(() => {
      if (verificationCode === sentCode) {
        const user: User | null = JSON.parse(localStorage.getItem('poker_user') || 'null');
        if (user) {
          user.isVerified = true;
          localStorage.setItem('poker_user', JSON.stringify(user));
          
          // Update in users array
          const users: User[] = JSON.parse(localStorage.getItem('poker_users') || '[]');
          const updatedUsers = users.map((u: User) => 
            u.id === user.id ? { ...u, isVerified: true } : u
          );
          localStorage.setItem('poker_users', JSON.stringify(updatedUsers));
          
          toast.success('Email verified successfully! Welcome to Jaafar Alsayed Poker!');
          navigate('/dashboard');
        }
      } else {
        toast.error('Invalid verification code. Please try again.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const resendCode = () => {
    const newCode = '123456'; // Always use the same code for demo
    setSentCode(newCode);
    console.log(`New verification code sent to ${userEmail}: ${newCode}`);
    toast.info(`New verification code sent to ${userEmail}`);
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
            <CardTitle className="text-2xl text-white">Verify Your Email</CardTitle>
            <CardDescription className="text-gray-300">
              We've sent a verification code to {userEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📧</div>
              <p className="text-white mb-2">Check your email for the verification code</p>
              <p className="text-sm text-gray-400">
                For demo purposes, the code is displayed in the browser console: <strong>123456</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code" className="text-white">Verification Code</Label>
                <Input
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-center text-2xl tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-gray-300">
                Didn't receive the code?{' '}
                <button
                  onClick={resendCode}
                  className="text-yellow-400 hover:text-yellow-300 font-semibold"
                >
                  Resend Code
                </button>
              </p>
              
              <button
                onClick={() => navigate('/register')}
                className="text-gray-400 hover:text-gray-300"
              >
                ← Back to Registration
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

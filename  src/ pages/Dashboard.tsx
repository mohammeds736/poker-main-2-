import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/user';

export default function Dashboard() {
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

  const menuItems = [
    {
      title: 'غرف اللعب',
      description: 'انضم إلى غرف البوكر المختلفة',
      icon: '🎯',
      color: 'from-blue-600 to-blue-800',
      path: '/game-rooms'
    },
    {
      title: 'الغرف الخاصة',
      description: 'أنشئ غرفتك الخاصة واربح المال',
      icon: '👑',
      color: 'from-purple-600 to-purple-800',
      path: '/private-rooms',
      badge: 'جديد'
    },
    {
      title: 'المحفظة',
      description: 'اشتر واستبدل العملات',
      icon: '💰',
      color: 'from-green-600 to-green-800',
      path: '/wallet'
    },
    {
      title: 'الإعدادات',
      description: 'إدارة حسابك وتفضيلاتك',
      icon: '⚙️',
      color: 'from-gray-600 to-gray-800',
      path: '/settings'
    }
  ];

  const quickStats = [
    { label: 'الرصيد الحالي', value: `${user?.coins || 0} 🪙`, color: 'text-yellow-400' },
    { label: 'الألعاب المكتملة', value: '0', color: 'text-green-400' },
    { label: 'نسبة الفوز', value: '0%', color: 'text-blue-400' },
    { label: 'المستوى', value: 'مبتدئ', color: 'text-purple-400' }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
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
            {['👑', '🎯', '💎', '🃏', '♠', '♥', '♦', '♣'][Math.floor(Math.random() * 8)]}
          </div>
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  مرحباً، {user.firstName}! 👋
                </h1>
                <p className="text-gray-300 mt-2">مرحباً بك في عالم البوكر الاحترافي</p>
              </div>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-300 text-sm mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Poker Table */}
          <Card className="bg-gradient-to-br from-green-700 to-green-900 mb-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10"></div>
            <CardContent className="p-8 relative z-10">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">👑</div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                  JAAFAR ALSAYED POKER
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  طاولة البوكر الاحترافية - جاهز للعب؟
                </p>
                
                {/* Poker Table Visualization */}
                <div className="relative mx-auto w-80 h-48 bg-gradient-to-br from-green-600 to-green-800 rounded-full border-8 border-yellow-300 shadow-2xl mb-6">
                  <div className="absolute inset-4 bg-green-700 rounded-full border-4 border-green-600 flex items-center justify-center">
                    <div className="text-yellow-300 font-bold text-lg">
                      🃏 POKER TABLE 🃏
                    </div>
                  </div>
                  
                  {/* Player positions */}
                  {[0, 1, 2, 3, 4, 5].map((position) => {
                    const angle = (position * 60) - 90;
                    const x = Math.cos(angle * Math.PI / 180) * 120;
                    const y = Math.sin(angle * Math.PI / 180) * 80;
                    
                    return (
                      <div
                        key={position}
                        className="absolute w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-2 border-yellow-300 flex items-center justify-center text-black font-bold"
                        style={{
                          left: `calc(50% + ${x}px - 24px)`,
                          top: `calc(50% + ${y}px - 24px)`,
                        }}
                      >
                        {position === 0 ? '👤' : '🤖'}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => navigate('/game-rooms')}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3"
                  >
                    🎯 ابدأ اللعب الآن
                  </Button>
                  <Button
                    onClick={() => navigate('/private-rooms')}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold px-8 py-3"
                  >
                    👑 الغرف الخاصة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item, index) => (
              <Card
                key={index}
                className={`bg-gradient-to-br ${item.color} text-white cursor-pointer transform hover:scale-105 transition-all duration-300 relative overflow-hidden`}
                onClick={() => navigate(item.path)}
              >
                {item.badge && (
                  <Badge className="absolute top-2 right-2 bg-red-500 animate-pulse">
                    {item.badge}
                  </Badge>
                )}
                <CardHeader>
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/80">
                    {item.description}
                  </CardDescription>
                </CardContent>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-8">
            <CardHeader>
              <CardTitle className="text-white">النشاط الأخير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4 opacity-50">📊</div>
                <p className="text-gray-300">لا يوجد نشاط بعد</p>
                <p className="text-gray-400 text-sm mt-2">ابدأ بلعب أول لعبة لك لرؤية الإحصائيات هنا</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

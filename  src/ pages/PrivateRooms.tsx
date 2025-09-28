import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User } from '@/types/user';
import { PrivateRoom } from '@/types/poker';
import PrivateRoomCreator from '@/components/PrivateRoomCreator';

export default function PrivateRooms() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<PrivateRoom[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<PrivateRoom | null>(null);
  const [roomPassword, setRoomPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Sample top earning rooms
  const topEarningRooms: PrivateRoom[] = [
    {
      id: 'top1',
      name: 'غرفة الملوك الذهبية',
      description: 'أعلى غرفة ربحاً هذا الأسبوع',
      ownerId: 999,
      ownerName: 'أحمد الملك',
      tableDesign: 'luxury',
      maxPlayers: 8,
      minBet: 500,
      maxBet: 10000,
      rakePercentage: 3,
      totalProfit: 45000,
      gamesPlayed: 234,
      isActive: true,
      players: [1, 2, 3, 4, 5],
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'top2',
      name: 'صالون الأثرياء',
      description: 'للاعبين المحترفين فقط',
      ownerId: 998,
      ownerName: 'سارة النجمة',
      tableDesign: 'modern',
      maxPlayers: 6,
      minBet: 200,
      maxBet: 5000,
      rakePercentage: 4,
      totalProfit: 32000,
      gamesPlayed: 189,
      isActive: true,
      players: [6, 7, 8],
      createdAt: '2024-01-10T14:30:00Z'
    },
    {
      id: 'top3',
      name: 'نادي الماس الأزرق',
      description: 'تجربة بوكر فاخرة',
      ownerId: 997,
      ownerName: 'محمد الفارس',
      tableDesign: 'luxury',
      maxPlayers: 10,
      minBet: 100,
      maxBet: 2000,
      rakePercentage: 5,
      totalProfit: 28500,
      gamesPlayed: 156,
      isActive: true,
      players: [9, 10, 11, 12],
      createdAt: '2024-01-08T09:15:00Z'
    },
    {
      id: 'top4',
      name: 'قاعة النخبة',
      description: 'للمحترفين والخبراء',
      ownerId: 996,
      ownerName: 'فاطمة الذكية',
      tableDesign: 'classic',
      maxPlayers: 6,
      minBet: 300,
      maxBet: 3000,
      rakePercentage: 4.5,
      totalProfit: 25000,
      gamesPlayed: 142,
      isActive: true,
      players: [13, 14],
      createdAt: '2024-01-05T16:45:00Z'
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('poker_user');
    if (userData) {
      setUser(JSON.parse(userData) as User);
    } else {
      navigate('/login');
    }

    // Load user's private rooms
    const savedRooms = localStorage.getItem('private_rooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms) as PrivateRoom[]);
    }
  }, [navigate]);

  const handleRoomCreated = (newRoom: PrivateRoom) => {
    if (!user) return;

    // Deduct setup cost from user's coins
    const setupCost = calculateSetupCost(newRoom);
    const updatedUser = { ...user, coins: user.coins - setupCost };
    
    setUser(updatedUser);
    localStorage.setItem('poker_user', JSON.stringify(updatedUser));

    // Add room to list
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    localStorage.setItem('private_rooms', JSON.stringify(updatedRooms));

    setShowCreator(false);
    toast.success(`تم إنشاء غرفة "${newRoom.name}" بنجاح!`);
  };

  const calculateSetupCost = (room: PrivateRoom): number => {
    const tableDesignCosts = { classic: 0, modern: 100, luxury: 500 };
    let cost = tableDesignCosts[room.tableDesign];
    
    if (room.maxPlayers > 6) cost += 50;
    if (room.maxBet > 5000) cost += 200;
    if (room.rakePercentage < 3) cost += 100;
    
    return cost;
  };

  const joinRoom = (room: PrivateRoom) => {
    if (room.password) {
      setSelectedRoom(room);
      setShowPasswordDialog(true);
    } else {
      // Join room directly
      navigate(`/poker-table/${room.id}`);
    }
  };

  const handlePasswordSubmit = () => {
    if (selectedRoom && roomPassword === selectedRoom.password) {
      setShowPasswordDialog(false);
      setRoomPassword('');
      navigate(`/poker-table/${selectedRoom.id}`);
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  const getTableDesignColor = (design: string) => {
    const colors = {
      classic: 'from-green-700 to-green-900',
      modern: 'from-blue-700 to-blue-900',
      luxury: 'from-yellow-600 to-yellow-800'
    };
    return colors[design as keyof typeof colors] || colors.classic;
  };

  const getTableDesignIcon = (design: string) => {
    const icons = {
      classic: '🟢',
      modern: '🔵',
      luxury: '🟡'
    };
    return icons[design as keyof typeof icons] || icons.classic;
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
            {['👑', '💎', '🏆', '💰', '🎯'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              الغرف الخاصة
            </h1>
            <p className="text-gray-300 mt-2">أنشئ غرفتك الخاصة واربح من كل لعبة</p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => setShowCreator(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              👑 إنشاء غرفة خاصة
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              ← العودة للوحة الرئيسية
            </Button>
          </div>
        </div>

        {/* Profit Advertisement */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">💰 اربح المال من غرفتك الخاصة!</h2>
                <p className="text-lg opacity-90">
                  احصل على نسبة من كل وعاء في غرفتك • إدارة كاملة للغرفة • أرباح يومية مضمونة
                </p>
                <div className="flex space-x-4 mt-4">
                  <div className="bg-white/20 px-3 py-1 rounded">
                    <span className="text-sm">متوسط الربح اليومي: 500-2000 🪙</span>
                  </div>
                  <div className="bg-white/20 px-3 py-1 rounded">
                    <span className="text-sm">عمولة: 1-10%</span>
                  </div>
                </div>
              </div>
              <div className="text-6xl opacity-50">💎</div>
            </div>
          </CardContent>
        </Card>

        {/* Top Earning Rooms */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            🏆 أعلى الغرف ربحاً هذا الأسبوع
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topEarningRooms.map((room, index) => (
              <Card 
                key={room.id}
                className={`bg-gradient-to-br ${getTableDesignColor(room.tableDesign)} text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300`}
                onClick={() => joinRoom(room)}
              >
                {index === 0 && (
                  <Badge className="absolute top-2 right-2 bg-yellow-600">👑 الأول</Badge>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl animate-pulse">{getTableDesignIcon(room.tableDesign)}</div>
                      <div>
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <p className="text-sm opacity-75">بواسطة {room.ownerName}</p>
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
                      <span>إجمالي الأرباح:</span>
                      <span className="text-yellow-300 font-bold">{room.totalProfit} 🪙</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الألعاب:</span>
                      <span>{room.gamesPlayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>اللاعبون:</span>
                      <span>{room.players.length}/{room.maxPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الرهان:</span>
                      <span>{room.minBet}-{room.maxBet} 🪙</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User's Private Rooms */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            🏠 غرفك الخاصة
            <Badge className="ml-3 bg-blue-600">{rooms.length}</Badge>
          </h2>
          
          {rooms.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4 opacity-50">🏠</div>
                <h3 className="text-xl font-bold text-white mb-2">لا توجد غرف خاصة بعد</h3>
                <p className="text-gray-300 mb-6">أنشئ غرفتك الأولى وابدأ في كسب الأرباح من كل لعبة</p>
                <Button
                  onClick={() => setShowCreator(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  إنشاء غرفة الآن
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card 
                  key={room.id}
                  className={`bg-gradient-to-br ${getTableDesignColor(room.tableDesign)} text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300`}
                  onClick={() => joinRoom(room)}
                >
                  <Badge className="absolute top-2 right-2 bg-green-600">مالك</Badge>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl animate-pulse">{getTableDesignIcon(room.tableDesign)}</div>
                      <div>
                        <CardTitle className="text-xl">{room.name}</CardTitle>
                        <p className="text-sm opacity-75">أنشئت في {new Date(room.createdAt).toLocaleDateString('ar')}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80 mb-4">
                      {room.description}
                    </CardDescription>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>إجمالي الأرباح:</span>
                        <span className="text-yellow-300 font-bold">{room.totalProfit} 🪙</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الألعاب:</span>
                        <span>{room.gamesPlayed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>اللاعبون:</span>
                        <span>{room.players.length}/{room.maxPlayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>العمولة:</span>
                        <span>{room.rakePercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الحالة:</span>
                        <span className={room.isActive ? 'text-green-300' : 'text-red-300'}>
                          {room.isActive ? 'نشطة' : 'متوقفة'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Room Creator Dialog */}
      {showCreator && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <PrivateRoomCreator
              user={user}
              onRoomCreated={handleRoomCreated}
              onCancel={() => setShowCreator(false)}
            />
          </div>
        </div>
      )}

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gray-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle>غرفة محمية بكلمة مرور</DialogTitle>
            <DialogDescription className="text-gray-300">
              هذه الغرفة محمية بكلمة مرور. أدخل كلمة المرور للانضمام.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roomPassword" className="text-white">كلمة المرور</Label>
              <Input
                id="roomPassword"
                type="password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="أدخل كلمة مرور الغرفة"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handlePasswordSubmit}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                دخول الغرفة
              </Button>
              <Button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setRoomPassword('');
                }}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

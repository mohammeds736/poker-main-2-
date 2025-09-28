import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PrivateRoom } from '@/types/poker';
import { User } from '@/types/user';

interface PrivateRoomCreatorProps {
  user: User;
  onRoomCreated: (room: PrivateRoom) => void;
  onCancel: () => void;
}

const tableDesigns = [
  {
    id: 'classic',
    name: 'الكلاسيكي',
    description: 'تصميم كازينو تقليدي مع اللون الأخضر',
    preview: '🟢',
    color: 'from-green-700 to-green-900',
    price: 0
  },
  {
    id: 'modern',
    name: 'العصري',
    description: 'تصميم حديث مع ألوان زرقاء متدرجة',
    preview: '🔵',
    color: 'from-blue-700 to-blue-900',
    price: 100
  },
  {
    id: 'luxury',
    name: 'الفاخر',
    description: 'تصميم ذهبي فاخر للغرف المميزة',
    preview: '🟡',
    color: 'from-yellow-600 to-yellow-800',
    price: 500
  }
];

export default function PrivateRoomCreator({ user, onRoomCreated, onCancel }: PrivateRoomCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tableDesign: 'classic' as 'classic' | 'modern' | 'luxury',
    maxPlayers: 6,
    minBet: 10,
    maxBet: 1000,
    rakePercentage: 5,
    hasPassword: false,
    password: ''
  });

  const [selectedDesign, setSelectedDesign] = useState(tableDesigns[0]);

  const handleDesignSelect = (designId: string) => {
    const design = tableDesigns.find(d => d.id === designId);
    if (design) {
      setSelectedDesign(design);
      setFormData(prev => ({ 
        ...prev, 
        tableDesign: designId as 'classic' | 'modern' | 'luxury'
      }));
    }
  };

  const calculateSetupCost = () => {
    let cost = selectedDesign.price;
    
    // Additional costs based on settings
    if (formData.maxPlayers > 6) cost += 50;
    if (formData.maxBet > 5000) cost += 200;
    if (formData.rakePercentage < 3) cost += 100; // Lower rake costs more
    
    return cost;
  };

  const calculatePotentialProfit = () => {
    // Estimate daily profit based on room settings
    const avgGamesPerDay = 20;
    const avgPotSize = (formData.minBet + formData.maxBet) / 2 * formData.maxPlayers;
    const dailyRake = avgGamesPerDay * avgPotSize * (formData.rakePercentage / 100);
    
    return Math.round(dailyRake);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const setupCost = calculateSetupCost();
    
    if (user.coins < setupCost) {
      alert(`تحتاج إلى ${setupCost} عملة لإنشاء هذه الغرفة. رصيدك الحالي: ${user.coins}`);
      return;
    }

    const newRoom: PrivateRoom = {
      id: `room_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      ownerId: user.id,
      ownerName: `${user.firstName} ${user.lastName}`,
      tableDesign: formData.tableDesign,
      maxPlayers: formData.maxPlayers,
      minBet: formData.minBet,
      maxBet: formData.maxBet,
      rakePercentage: formData.rakePercentage,
      totalProfit: 0,
      gamesPlayed: 0,
      isActive: true,
      players: [],
      createdAt: new Date().toISOString(),
      password: formData.hasPassword ? formData.password : undefined
    };

    onRoomCreated(newRoom);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">إنشاء غرفة خاصة</CardTitle>
          <CardDescription className="text-gray-300 text-center">
            أنشئ غرفة البوكر الخاصة بك واربح من كل لعبة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomName" className="text-white">اسم الغرفة</Label>
                <Input
                  id="roomName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="أدخل اسم الغرفة"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="maxPlayers" className="text-white">عدد اللاعبين الأقصى</Label>
                <Select
                  value={formData.maxPlayers.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, maxPlayers: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} لاعبين
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-white">وصف الغرفة</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
                placeholder="اكتب وصفاً للغرفة..."
                rows={3}
              />
            </div>

            {/* Table Design Selection */}
            <div>
              <Label className="text-white text-lg mb-4 block">تصميم الطاولة</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tableDesigns.map((design) => (
                  <Card
                    key={design.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedDesign.id === design.id
                        ? 'ring-2 ring-yellow-400 bg-white/20'
                        : 'bg-white/10 hover:bg-white/15'
                    } backdrop-blur-lg border-white/20`}
                    onClick={() => handleDesignSelect(design.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-6xl mb-2">{design.preview}</div>
                      <h3 className="text-white font-bold">{design.name}</h3>
                      <p className="text-gray-300 text-sm mb-2">{design.description}</p>
                      <Badge className={design.price > 0 ? 'bg-yellow-600' : 'bg-green-600'}>
                        {design.price > 0 ? `${design.price} 🪙` : 'مجاني'}
                      </Badge>
                      
                      {/* Preview Table */}
                      <div className={`mt-3 w-full h-16 bg-gradient-to-br ${design.color} rounded-full border-2 border-yellow-300 flex items-center justify-center`}>
                        <div className="text-yellow-300 text-xs font-bold">معاينة الطاولة</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Betting Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">الحد الأدنى للرهان: {formData.minBet} 🪙</Label>
                <Slider
                  value={[formData.minBet]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, minBet: value[0] }))}
                  max={1000}
                  min={1}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-white">الحد الأقصى للرهان: {formData.maxBet} 🪙</Label>
                <Slider
                  value={[formData.maxBet]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, maxBet: value[0] }))}
                  max={50000}
                  min={formData.minBet}
                  step={50}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Rake Percentage */}
            <div>
              <Label className="text-white">نسبة العمولة (الريك): {formData.rakePercentage}%</Label>
              <Slider
                value={[formData.rakePercentage]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rakePercentage: value[0] }))}
                max={10}
                min={1}
                step={0.5}
                className="mt-2"
              />
              <p className="text-gray-400 text-sm mt-1">
                هذه النسبة من كل وعاء ستكون ربحك من الغرفة
              </p>
            </div>

            {/* Password Protection */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.hasPassword}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasPassword: checked }))}
              />
              <Label className="text-white">حماية الغرفة بكلمة مرور</Label>
            </div>

            {formData.hasPassword && (
              <div>
                <Label htmlFor="password" className="text-white">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="أدخل كلمة مرور الغرفة"
                />
              </div>
            )}

            {/* Cost and Profit Summary */}
            <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30">
              <CardContent className="p-4">
                <h3 className="text-white font-bold mb-3">ملخص التكاليف والأرباح</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">تكلفة الإنشاء:</span>
                    <span className="text-yellow-400 font-bold ml-2">{calculateSetupCost()} 🪙</span>
                  </div>
                  <div>
                    <span className="text-gray-300">الربح المتوقع يومياً:</span>
                    <span className="text-green-400 font-bold ml-2">{calculatePotentialProfit()} 🪙</span>
                  </div>
                  <div>
                    <span className="text-gray-300">رصيدك الحالي:</span>
                    <span className="text-white font-bold ml-2">{user.coins} 🪙</span>
                  </div>
                  <div>
                    <span className="text-gray-300">الرصيد بعد الإنشاء:</span>
                    <span className={`font-bold ml-2 ${user.coins - calculateSetupCost() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {user.coins - calculateSetupCost()} 🪙
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4 justify-center">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                disabled={user.coins < calculateSetupCost()}
              >
                إنشاء الغرفة ({calculateSetupCost()} 🪙)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

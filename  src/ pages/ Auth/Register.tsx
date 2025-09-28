import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User } from '@/types/user';
import { BiometricVerification } from '@/types/poker';
import BiometricVerificationComponent from '@/components/BiometricVerification';

const countries = [
  { code: 'SA', name: 'السعودية', flag: '🇸🇦' },
  { code: 'AE', name: 'الإمارات', flag: '🇦🇪' },
  { code: 'EG', name: 'مصر', flag: '🇪🇬' },
  { code: 'JO', name: 'الأردن', flag: '🇯🇴' },
  { code: 'LB', name: 'لبنان', flag: '🇱🇧' },
  { code: 'SY', name: 'سوريا', flag: '🇸🇾' },
  { code: 'IQ', name: 'العراق', flag: '🇮🇶' },
  { code: 'KW', name: 'الكويت', flag: '🇰🇼' },
  { code: 'QA', name: 'قطر', flag: '🇶🇦' },
  { code: 'BH', name: 'البحرين', flag: '🇧🇭' },
  { code: 'OM', name: 'عمان', flag: '🇴🇲' },
  { code: 'YE', name: 'اليمن', flag: '🇾🇪' },
  { code: 'PS', name: 'فلسطين', flag: '🇵🇸' },
  { code: 'MA', name: 'المغرب', flag: '🇲🇦' },
  { code: 'DZ', name: 'الجزائر', flag: '🇩🇿' },
  { code: 'TN', name: 'تونس', flag: '🇹🇳' },
  { code: 'LY', name: 'ليبيا', flag: '🇱🇾' },
  { code: 'SD', name: 'السودان', flag: '🇸🇩' },
  { code: 'US', name: 'الولايات المتحدة', flag: '🇺🇸' },
  { code: 'GB', name: 'المملكة المتحدة', flag: '🇬🇧' },
  { code: 'FR', name: 'فرنسا', flag: '🇫🇷' },
  { code: 'DE', name: 'ألمانيا', flag: '🇩🇪' },
  { code: 'IT', name: 'إيطاليا', flag: '🇮🇹' },
  { code: 'ES', name: 'إسبانيا', flag: '🇪🇸' },
  { code: 'TR', name: 'تركيا', flag: '🇹🇷' },
  { code: 'IR', name: 'إيران', flag: '🇮🇷' },
  { code: 'PK', name: 'باكستان', flag: '🇵🇰' },
  { code: 'IN', name: 'الهند', flag: '🇮🇳' },
  { code: 'BD', name: 'بنغلاديش', flag: '🇧🇩' },
  { code: 'MY', name: 'ماليزيا', flag: '🇲🇾' },
  { code: 'ID', name: 'إندونيسيا', flag: '🇮🇩' }
];

const idTypes = [
  { value: 'national_id', label: 'هوية وطنية' },
  { value: 'passport', label: 'جواز سفر' },
  { value: 'driver_license', label: 'رخصة قيادة' },
  { value: 'residence_permit', label: 'إقامة' }
];

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+966',
    country: 'SA',
    idType: '',
    idNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [biometricData, setBiometricData] = useState<BiometricVerification | null>(null);

  const steps = [
    { number: 1, title: 'المعلومات الشخصية', icon: '👤' },
    { number: 2, title: 'معلومات الهوية', icon: '🆔' },
    { number: 3, title: 'التحقق الحيوي', icon: '🔐' },
    { number: 4, title: 'إنشاء كلمة المرور', icon: '🔑' }
  ];

  const countryCodes = [
    { code: '+966', country: 'SA', name: 'السعودية' },
    { code: '+971', country: 'AE', name: 'الإمارات' },
    { code: '+20', country: 'EG', name: 'مصر' },
    { code: '+962', country: 'JO', name: 'الأردن' },
    { code: '+961', country: 'LB', name: 'لبنان' },
    { code: '+963', country: 'SY', name: 'سوريا' },
    { code: '+964', country: 'IQ', name: 'العراق' },
    { code: '+965', country: 'KW', name: 'الكويت' },
    { code: '+974', country: 'QA', name: 'قطر' },
    { code: '+973', country: 'BH', name: 'البحرين' },
    { code: '+968', country: 'OM', name: 'عمان' },
    { code: '+967', country: 'YE', name: 'اليمن' },
    { code: '+970', country: 'PS', name: 'فلسطين' },
    { code: '+212', country: 'MA', name: 'المغرب' },
    { code: '+213', country: 'DZ', name: 'الجزائر' },
    { code: '+216', country: 'TN', name: 'تونس' },
    { code: '+218', country: 'LY', name: 'ليبيا' },
    { code: '+249', country: 'SD', name: 'السودان' },
    { code: '+1', country: 'US', name: 'الولايات المتحدة' },
    { code: '+44', country: 'GB', name: 'المملكة المتحدة' },
    { code: '+33', country: 'FR', name: 'فرنسا' },
    { code: '+49', country: 'DE', name: 'ألمانيا' },
    { code: '+39', country: 'IT', name: 'إيطاليا' },
    { code: '+34', country: 'ES', name: 'إسبانيا' },
    { code: '+90', country: 'TR', name: 'تركيا' },
    { code: '+98', country: 'IR', name: 'إيران' },
    { code: '+92', country: 'PK', name: 'باكستان' },
    { code: '+91', country: 'IN', name: 'الهند' },
    { code: '+880', country: 'BD', name: 'بنغلاديش' },
    { code: '+60', country: 'MY', name: 'ماليزيا' },
    { code: '+62', country: 'ID', name: 'إندونيسيا' }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        toast.error('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.idType || !formData.idNumber) {
        toast.error('يرجى ملء معلومات الهوية');
        return;
      }
      setShowBiometric(true);
      return;
    }
    
    if (currentStep === 3) {
      if (!biometricData || !biometricData.faceMatched) {
        toast.error('يرجى إكمال التحقق الحيوي');
        return;
      }
    }
    
    if (currentStep === 4) {
      handleRegister();
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleBiometricComplete = (result: BiometricVerification) => {
    setBiometricData(result);
    setShowBiometric(false);
    setCurrentStep(4);
    toast.success('تم التحقق الحيوي بنجاح!');
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);

    // Simulate registration process
    setTimeout(() => {
      const newUser: User = {
        id: Date.now(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        country: formData.country,
        idType: formData.idType,
        idNumber: formData.idNumber,
        isVerified: true,
        coins: 1000, // Starting bonus
        createdAt: new Date().toISOString(),
        biometricData: biometricData || undefined
      };

      // Save to localStorage
      const existingUsers: User[] = JSON.parse(localStorage.getItem('poker_users') || '[]');
      existingUsers.push(newUser);
      localStorage.setItem('poker_users', JSON.stringify(existingUsers));
      localStorage.setItem('poker_user', JSON.stringify(newUser));

      setIsLoading(false);
      toast.success('تم إنشاء الحساب بنجاح! مرحباً بك في عالم البوكر');
      navigate('/email-verification');
    }, 2000);
  };

  const getCountryByCode = (code: string) => {
    return countries.find(c => c.code === code);
  };

  if (showBiometric) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <BiometricVerificationComponent
            onVerificationComplete={handleBiometricComplete}
            onCancel={() => setShowBiometric(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-6">
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

      <div className="w-full max-w-2xl relative z-10">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4 animate-pulse">👑</div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              انضم إلى عالم البوكر
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              أنشئ حسابك واحصل على 1000 عملة مجانية للبدء
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-8">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center space-y-2">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300
                    ${currentStep >= step.number 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black' 
                      : 'bg-gray-600 text-gray-300'
                    }
                  `}>
                    {currentStep > step.number ? '✓' : step.icon}
                  </div>
                  <span className={`text-sm text-center ${
                    currentStep >= step.number ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            <Progress value={(currentStep / steps.length) * 100} className="mb-6" />

            {/* Step Content */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">المعلومات الشخصية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">الاسم الأول *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="أدخل اسمك الأول"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName" className="text-white">اسم العائلة *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="أدخل اسم العائلة"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">البلد</Label>
                    <Select value={formData.country} onValueChange={(value) => {
                      const countryCode = countryCodes.find(cc => cc.country === value);
                      setFormData({
                        ...formData, 
                        country: value,
                        countryCode: countryCode?.code || '+966'
                      });
                    }}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white">رقم الهاتف *</Label>
                    <div className="flex space-x-2">
                      <Select value={formData.countryCode} onValueChange={(value) => setFormData({...formData, countryCode: value})}>
                        <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((cc) => (
                            <SelectItem key={cc.code} value={cc.code}>
                              {cc.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="رقم الهاتف"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">معلومات الهوية</h3>
                
                <div>
                  <Label className="text-white">نوع الهوية *</Label>
                  <Select value={formData.idType} onValueChange={(value) => setFormData({...formData, idType: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="اختر نوع الهوية" />
                    </SelectTrigger>
                    <SelectContent>
                      {idTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="idNumber" className="text-white">رقم الهوية *</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="أدخل رقم الهوية"
                    required
                  />
                </div>

                <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">🔒 الأمان والخصوصية</h4>
                  <p className="text-gray-300 text-sm">
                    معلومات الهوية الخاصة بك محمية بتشفير عالي المستوى ولن يتم مشاركتها مع أي طرف ثالث. 
                    نحن نستخدم هذه المعلومات فقط للتحقق من الهوية وضمان أمان المنصة.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">إنشاء كلمة المرور</h3>
                
                {biometricData && (
                  <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">✅</div>
                      <div>
                        <h4 className="text-white font-semibold">تم التحقق الحيوي بنجاح</h4>
                        <p className="text-gray-300 text-sm">
                          دقة التحقق: {(biometricData.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="password" className="text-white">كلمة المرور *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="أدخل كلمة مرور قوية"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-white">تأكيد كلمة المرور *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                </div>

                <div className="bg-yellow-600/20 border border-yellow-400/30 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">🎁 مكافأة الترحيب</h4>
                  <p className="text-gray-300 text-sm">
                    ستحصل على 1000 عملة مجانية عند إكمال التسجيل لتبدأ رحلتك في عالم البوكر!
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white disabled:opacity-50"
              >
                السابق
              </Button>

              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
              >
                {isLoading ? 'جاري الإنشاء...' : 
                 currentStep === 4 ? 'إنشاء الحساب' : 
                 currentStep === 2 ? 'التحقق الحيوي' : 'التالي'}
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-gray-300">
                لديك حساب بالفعل؟{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-yellow-400 hover:text-yellow-300 font-semibold"
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

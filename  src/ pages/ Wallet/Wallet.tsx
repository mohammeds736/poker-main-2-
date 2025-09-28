import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User } from '@/types/user';
import { CoinPackage, PaymentMethod } from '@/types/game';

const coinPackages: CoinPackage[] = [
  { id: 1, amount: 100, price: 10, color: 'from-gray-400 to-gray-600', popular: false },
  { id: 2, amount: 250, price: 20, color: 'from-green-400 to-green-600', popular: false },
  { id: 3, amount: 500, price: 35, color: 'from-blue-400 to-blue-600', popular: true },
  { id: 4, amount: 750, price: 50, color: 'from-purple-400 to-purple-600', popular: false },
  { id: 5, amount: 1000, price: 60, color: 'from-yellow-400 to-yellow-600', popular: false },
  { id: 6, amount: 2000, price: 100, color: 'from-orange-400 to-orange-600', popular: false },
  { id: 7, amount: 3000, price: 140, color: 'from-pink-400 to-pink-600', popular: false },
  { id: 8, amount: 5000, price: 200, color: 'from-red-400 to-red-600', popular: false },
  { id: 9, amount: 7500, price: 280, color: 'from-indigo-400 to-indigo-600', popular: false },
  { id: 10, amount: 10000, price: 350, color: 'from-emerald-400 to-emerald-600', popular: false }
];

const sellPackages: CoinPackage[] = [
  { id: 1, amount: 100, value: 8, color: 'from-gray-400 to-gray-600' },
  { id: 2, amount: 250, value: 18, color: 'from-green-400 to-green-600' },
  { id: 3, amount: 500, value: 32, color: 'from-blue-400 to-blue-600' },
  { id: 4, amount: 750, value: 45, color: 'from-purple-400 to-purple-600' },
  { id: 5, amount: 1000, value: 55, color: 'from-yellow-400 to-yellow-600' },
  { id: 6, amount: 2000, value: 90, color: 'from-orange-400 to-orange-600' },
  { id: 7, amount: 3000, value: 125, color: 'from-pink-400 to-pink-600' },
  { id: 8, amount: 5000, value: 180, color: 'from-red-400 to-red-600' },
  { id: 9, amount: 7500, value: 250, color: 'from-indigo-400 to-indigo-600' },
  { id: 10, amount: 10000, value: 310, color: 'from-emerald-400 to-emerald-600' }
];

const paymentMethods: PaymentMethod[] = [
  { id: 'western', name: 'Western Union', icon: '🏦' },
  { id: 'moneygram', name: 'MoneyGram', icon: '💸' },
  { id: 'admin', name: 'Contact Admin Directly', icon: '👨‍💼' }
];

export default function Wallet() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [paymentDetails, setPaymentDetails] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('poker_user');
    if (userData) {
      setUser(JSON.parse(userData) as User);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleBuyPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setTransactionType('buy');
    setActiveTab('buy-payment');
  };

  const handleSellPackage = (pkg: CoinPackage) => {
    if (user && user.coins < pkg.amount) {
      toast.error('Insufficient coins for this transaction');
      return;
    }
    setSelectedPackage(pkg);
    setTransactionType('sell');
    setActiveTab('sell-payment');
  };

  const openPaymentDialog = () => {
    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return;
    }
    setShowPaymentDialog(true);
  };

  const processTransaction = () => {
    if (!selectedPayment || !selectedPackage) {
      toast.error('Please complete all required fields');
      return;
    }

    if (transactionType === 'buy' && (!paymentDetails.fullName || !paymentDetails.phoneNumber)) {
      toast.error('Please fill in your contact details');
      return;
    }

    // Simulate transaction processing
    const transactionId = `TXN${Date.now()}`;
    
    if (user && selectedPackage) {
      if (transactionType === 'buy') {
        // For demo purposes, immediately add coins
        const updatedUser = { ...user, coins: user.coins + selectedPackage.amount };
        localStorage.setItem('poker_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast.success(`Successfully purchased ${selectedPackage.amount} coins! Transaction ID: ${transactionId}`);
      } else {
        // For selling, deduct coins
        const updatedUser = { ...user, coins: user.coins - selectedPackage.amount };
        localStorage.setItem('poker_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast.success(`Successfully sold ${selectedPackage.amount} coins for $${selectedPackage.value}! Transaction ID: ${transactionId}`);
      }

      // Reset form
      setActiveTab('overview');
      setSelectedPackage(null);
      setSelectedPayment('');
      setShowPaymentDialog(false);
      setPaymentDetails({ fullName: '', phoneNumber: '', email: '', notes: '' });
    }
  };

  const getPaymentInstructions = (method: string, type: 'buy' | 'sell') => {
    const action = type === 'buy' ? 'purchase' : 'sell';
    const amount = type === 'buy' ? selectedPackage?.price : selectedPackage?.value;
    
    switch (method) {
      case 'western':
        return {
          title: 'Western Union Transfer',
          instructions: [
            `Send $${amount} via Western Union to our authorized agent`,
            'Receiver Name: JAAFAR ALSAYED POKER',
            'Country: United States',
            'After sending, provide the MTCN number',
            'Transaction will be processed within 1-2 hours'
          ]
        };
      case 'moneygram':
        return {
          title: 'MoneyGram Transfer',
          instructions: [
            `Send $${amount} via MoneyGram`,
            'Receiver Name: JAAFAR ALSAYED POKER',
            'Country: United States', 
            'Provide the reference number after sending',
            'Processing time: 1-2 hours'
          ]
        };
      case 'admin':
        return {
          title: 'Direct Admin Contact',
          instructions: [
            'Contact our admin directly for personalized assistance',
            'WhatsApp: +1-555-POKER-ADMIN',
            'Email: admin@jaafarpoker.com',
            'Telegram: @JaafarPokerAdmin',
            'Available 24/7 for support'
          ]
        };
      default:
        return { title: '', instructions: [] };
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
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
            {['💰', '💎', '🪙', '💸', '🏦'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Wallet Management
            </h1>
            <p className="text-gray-300 mt-2">Buy, sell, and manage your poker coins</p>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Current Balance</h2>
                <p className="text-4xl font-bold">{user.coins} 🪙</p>
              </div>
              <div className="text-6xl opacity-50">💰</div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'buy', label: 'Buy Coins', icon: '🛒' },
            { id: 'sell', label: 'Sell Coins', icon: '💸' }
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              } px-6 py-3`}
            >
              {tab.icon} {tab.label}
            </Button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Total Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400">{user.coins} 🪙</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Total Purchased</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">0 🪙</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Total Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">0 🪙</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'buy' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Buy Coin Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {coinPackages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`bg-gradient-to-br ${pkg.color} text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300`}
                  onClick={() => handleBuyPackage(pkg)}
                >
                  {pkg.popular && (
                    <Badge className="absolute top-2 right-2 bg-red-500">Popular</Badge>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4 animate-bounce">🪙</div>
                    <div className="text-2xl font-bold mb-2">{pkg.amount} Coins</div>
                    <div className="text-lg">${pkg.price}</div>
                    <div className="text-sm opacity-75 mt-2">
                      ${((pkg.price || 0) / pkg.amount * 100).toFixed(1)} per 100 coins
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sell' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Sell Coin Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {sellPackages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`bg-gradient-to-br ${pkg.color} text-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 ${
                    user.coins < pkg.amount ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleSellPackage(pkg)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4 animate-pulse">💰</div>
                    <div className="text-2xl font-bold mb-2">{pkg.amount} Coins</div>
                    <div className="text-lg">${pkg.value}</div>
                    <div className="text-sm opacity-75 mt-2">
                      ${((pkg.value || 0) / pkg.amount * 100).toFixed(1)} per 100 coins
                    </div>
                    {user.coins < pkg.amount && (
                      <div className="text-xs text-red-300 mt-2">Insufficient coins</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'buy-payment' || activeTab === 'sell-payment') && selectedPackage && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">
                {activeTab === 'buy-payment' ? 'Purchase' : 'Sell'} {selectedPackage.amount} Coins
              </CardTitle>
              <CardDescription className="text-gray-300">
                {activeTab === 'buy-payment' 
                  ? `Total: $${selectedPackage.price}` 
                  : `You will receive: $${selectedPackage.value}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-white">Select Payment Method</label>
                  <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Choose payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.icon} {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPayment && (
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Payment Instructions</h3>
                    <div className="text-gray-300 text-sm space-y-2">
                      {getPaymentInstructions(selectedPayment, transactionType).instructions.map((instruction, index) => (
                        <p key={index}>• {instruction}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    onClick={openPaymentDialog}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    disabled={!selectedPayment}
                  >
                    {activeTab === 'buy-payment' ? 'Proceed to Purchase' : 'Proceed to Sell'}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveTab(activeTab === 'buy-payment' ? 'buy' : 'sell');
                      setSelectedPackage(null);
                      setSelectedPayment('');
                    }}
                    variant="outline"
                    className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-gray-900 text-white border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Transaction</DialogTitle>
            <DialogDescription className="text-gray-300">
              Please provide your details to complete the {transactionType === 'buy' ? 'purchase' : 'sale'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Transaction Summary */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-2">Transaction Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Amount:</span>
                    <span className="text-white font-bold ml-2">{selectedPackage?.amount} 🪙</span>
                  </div>
                  <div>
                    <span className="text-gray-300">
                      {transactionType === 'buy' ? 'Cost:' : 'You receive:'}
                    </span>
                    <span className="text-yellow-400 font-bold ml-2">
                      ${transactionType === 'buy' ? selectedPackage?.price : selectedPackage?.value}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Method:</span>
                    <span className="text-white font-bold ml-2">
                      {paymentMethods.find(m => m.id === selectedPayment)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Processing:</span>
                    <span className="text-green-400 font-bold ml-2">1-2 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                <Input
                  id="fullName"
                  value={paymentDetails.fullName}
                  onChange={(e) => setPaymentDetails({...paymentDetails, fullName: e.target.value})}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber" className="text-white">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={paymentDetails.phoneNumber}
                  onChange={(e) => setPaymentDetails({...paymentDetails, phoneNumber: e.target.value})}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={paymentDetails.email}
                onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Enter your email (optional)"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-white">Additional Notes</Label>
              <Textarea
                id="notes"
                value={paymentDetails.notes}
                onChange={(e) => setPaymentDetails({...paymentDetails, notes: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Any additional information or special requests"
                rows={3}
              />
            </div>

            {/* Payment Instructions */}
            {selectedPayment && (
              <Card className="bg-blue-600/20 border-blue-400/30">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">
                    {getPaymentInstructions(selectedPayment, transactionType).title}
                  </h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    {getPaymentInstructions(selectedPayment, transactionType).instructions.map((instruction, index) => (
                      <p key={index}>• {instruction}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={processTransaction}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Confirm Transaction
              </Button>
              <Button
                onClick={() => setShowPaymentDialog(false)}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

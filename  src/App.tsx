import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import EmailVerification from './pages/Auth/EmailVerification';
import Dashboard from './pages/Dashboard';
import GameRooms from './pages/Game/GameRooms';
import PokerTable from './pages/Game/PokerTable';
import Wallet from './pages/Wallet/Wallet';
import AccountSettings from './pages/Settings/AccountSettings';
import PrivateRooms from './pages/PrivateRooms';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game-rooms" element={<GameRooms />} />
          <Route path="/poker-table/:roomId" element={<PokerTable />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/private-rooms" element={<PrivateRooms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

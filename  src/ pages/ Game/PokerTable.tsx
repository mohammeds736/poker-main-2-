import { useParams } from 'react-router-dom';
import EnhancedPokerTable from '@/components/EnhancedPokerTable';

export default function PokerTable() {
  const { roomId } = useParams<{ roomId: string }>();
  
  if (!roomId) {
    return <div>Invalid room ID</div>;
  }

  return <EnhancedPokerTable roomId={roomId} />;
}

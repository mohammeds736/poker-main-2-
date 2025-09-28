import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types/user';

interface ChatMessage {
  id: number;
  player: string;
  message: string;
  timestamp: string;
  type: 'text' | 'voice' | 'video' | 'system';
  avatar?: string;
}

interface ChatSystemProps {
  roomId: string;
  currentUser: User;
  showChat: boolean;
  onToggleChat: () => void;
}

export default function ChatSystem({ roomId, currentUser, showChat, onToggleChat }: ChatSystemProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatMode, setChatMode] = useState<'text' | 'voice' | 'video'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  useEffect(() => {
    // Load existing messages for this room
    const savedMessages = localStorage.getItem(`chat_${roomId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages) as ChatMessage[]);
    }

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now(),
      player: 'System',
      message: `Welcome to ${roomId} room! Chat with other players here.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      avatar: '🤖'
    };
    
    setMessages(prev => {
      if (prev.length === 0) {
        return [welcomeMessage];
      }
      return prev;
    });
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Save messages to localStorage
    if (messages.length > 0) {
      localStorage.setItem(`chat_${roomId}`, JSON.stringify(messages));
    }
  }, [messages, roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendTextMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now(),
        player: `${currentUser.firstName} ${currentUser.lastName}`,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        type: 'text',
        avatar: '👤'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate other players responding occasionally
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const botResponses = [
            'Good luck!', 'Nice hand!', 'Great play!', 'Well done!', 
            'Interesting move', 'I fold', 'All in!', 'Good game everyone'
          ];
          const botNames = ['Alex Bot', 'Sarah Bot', 'Mike Bot', 'Lisa Bot', 'John Bot'];
          
          const botMessage: ChatMessage = {
            id: Date.now() + 1,
            player: botNames[Math.floor(Math.random() * botNames.length)],
            message: botResponses[Math.floor(Math.random() * botResponses.length)],
            timestamp: new Date().toLocaleTimeString(),
            type: 'text',
            avatar: '🤖'
          };
          
          setMessages(prev => [...prev, botMessage]);
        }, 1000 + Math.random() * 3000);
      }
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // In a real implementation, you would upload this audio data
          const message: ChatMessage = {
            id: Date.now(),
            player: `${currentUser.firstName} ${currentUser.lastName}`,
            message: '🎤 Voice message',
            timestamp: new Date().toLocaleTimeString(),
            type: 'voice',
            avatar: '👤'
          };
          
          setMessages(prev => [...prev, message]);
        }
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopVoiceRecording();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsVideoCall(true);
        
        const message: ChatMessage = {
          id: Date.now(),
          player: `${currentUser.firstName} ${currentUser.lastName}`,
          message: '📹 Started video call',
          timestamp: new Date().toLocaleTimeString(),
          type: 'video',
          avatar: '👤'
        };
        
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopVideoCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsVideoCall(false);
      
      const message: ChatMessage = {
        id: Date.now(),
        player: `${currentUser.firstName} ${currentUser.lastName}`,
        message: '📹 Ended video call',
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
        avatar: '👤'
      };
      
      setMessages(prev => [...prev, message]);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'voice': return '🎤';
      case 'video': return '📹';
      case 'system': return '🤖';
      default: return '💬';
    }
  };

  if (!showChat) return null;

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-96">
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <h3 className="text-white font-bold">💬 Chat & Communication</h3>
        <div className="flex items-center space-x-2">
          <Select value={chatMode} onValueChange={(value) => setChatMode(value as 'text' | 'voice' | 'video')}>
            <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">💬 Text</SelectItem>
              <SelectItem value="voice">🎤 Voice</SelectItem>
              <SelectItem value="video">📹 Video</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={onToggleChat}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            {showChat ? '👁️' : '👁️‍🗨️'}
          </Button>
        </div>
      </div>
      
      {/* Video Call Area */}
      {isVideoCall && (
        <div className="p-2 border-b border-white/20">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-32 bg-black rounded border"
          />
          <Button
            onClick={stopVideoCall}
            size="sm"
            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
          >
            End Video Call
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-4 h-48 overflow-y-auto">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-lg">{msg.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${
                      msg.type === 'system' ? 'text-blue-400' : 
                      msg.player.includes('Bot') ? 'text-purple-400' : 'text-yellow-400'
                    }`}>
                      {msg.player}:
                    </span>
                    <span className="text-xs">{getMessageIcon(msg.type)}</span>
                    <Badge className="text-xs bg-gray-600">{msg.timestamp}</Badge>
                  </div>
                  <div className={`text-white mt-1 ${
                    msg.type === 'system' ? 'text-gray-400 italic' : ''
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-white/20">
        {chatMode === 'text' && (
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button
              onClick={sendTextMessage}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              Send
            </Button>
          </div>
        )}

        {chatMode === 'voice' && (
          <div className="flex space-x-2 items-center">
            <Button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`flex-1 ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
            </Button>
            {isRecording && (
              <Badge className="bg-red-600 animate-pulse">
                Recording...
              </Badge>
            )}
          </div>
        )}

        {chatMode === 'video' && (
          <div className="flex space-x-2">
            <Button
              onClick={isVideoCall ? stopVideoCall : startVideoCall}
              className={`flex-1 ${
                isVideoCall 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isVideoCall ? '📹 End Video' : '📹 Start Video'}
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2 mt-2">
          <Button
            onClick={() => {
              setNewMessage('Good luck everyone!');
              setTimeout(sendTextMessage, 100);
            }}
            size="sm"
            variant="outline"
            className="text-xs border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
          >
            👍 Good Luck
          </Button>
          <Button
            onClick={() => {
              setNewMessage('Nice hand!');
              setTimeout(sendTextMessage, 100);
            }}
            size="sm"
            variant="outline"
            className="text-xs border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
          >
            🎉 Nice Hand
          </Button>
          <Button
            onClick={() => {
              setNewMessage('gg wp');
              setTimeout(sendTextMessage, 100);
            }}
            size="sm"
            variant="outline"
            className="text-xs border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
          >
            🤝 GG
          </Button>
        </div>
      </div>
    </Card>
  );
}

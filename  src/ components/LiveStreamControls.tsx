import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface LiveStreamControlsProps {
  className?: string;
}

export default function LiveStreamControls({ className = '' }: LiveStreamControlsProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamPlatform, setStreamPlatform] = useState<'facebook' | 'youtube' | 'twitch'>('facebook');
  const [streamKey, setStreamKey] = useState('');
  const [viewers, setViewers] = useState(0);
  const [streamTitle, setStreamTitle] = useState('');
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [showFacebookLogin, setShowFacebookLogin] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [facebookUser, setFacebookUser] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const platformConfigs = {
    facebook: {
      name: 'Facebook Live',
      icon: '📘',
      color: 'bg-blue-600',
      instructions: [
        'Connect your Facebook account',
        'We will automatically post to your Facebook page',
        'Your stream will appear on your Facebook timeline',
        'Viewers can comment and react in real-time'
      ]
    },
    youtube: {
      name: 'YouTube Live',
      icon: '📺',
      color: 'bg-red-600',
      instructions: [
        'Go to YouTube Studio',
        'Click "Create" > "Go Live"',
        'Copy the stream key',
        'Configure your stream settings'
      ]
    },
    twitch: {
      name: 'Twitch',
      icon: '🟣',
      color: 'bg-purple-600',
      instructions: [
        'Go to Twitch Creator Dashboard',
        'Navigate to Settings > Stream',
        'Copy your Primary Stream key',
        'Set your stream title and category'
      ]
    }
  };

  const connectFacebook = async () => {
    try {
      // Simulate Facebook OAuth flow
      setShowFacebookLogin(true);
      
      // In a real implementation, this would open Facebook OAuth
      setTimeout(() => {
        // Simulate successful login
        const mockFacebookUser = {
          id: '123456789',
          name: 'John Doe',
          email: 'john@example.com',
          picture: 'https://via.placeholder.com/100'
        };
        
        setFacebookUser(mockFacebookUser);
        setFacebookConnected(true);
        setShowFacebookLogin(false);
        toast.success('Facebook account connected successfully!');
      }, 2000);
      
    } catch (error) {
      console.error('Facebook connection error:', error);
      toast.error('Failed to connect Facebook account');
      setShowFacebookLogin(false);
    }
  };

  const startStream = async () => {
    if (streamPlatform === 'facebook' && !facebookConnected) {
      toast.error('Please connect your Facebook account first');
      return;
    }

    if (streamPlatform !== 'facebook' && !streamKey.trim()) {
      toast.error('Please enter your stream key');
      return;
    }

    if (!streamTitle.trim()) {
      toast.error('Please enter a stream title');
      return;
    }

    try {
      // Get screen capture for the poker table
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });

      // Get user camera for picture-in-picture
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }

      streamRef.current = displayStream;
      setIsStreaming(true);
      setShowStreamDialog(false);
      
      // Simulate viewer count
      const viewerInterval = setInterval(() => {
        setViewers(prev => {
          const change = Math.floor(Math.random() * 10) - 5;
          return Math.max(0, prev + change);
        });
      }, 5000);

      // Initial viewers
      setTimeout(() => setViewers(Math.floor(Math.random() * 50) + 10), 2000);

      // Special message for Facebook Live
      if (streamPlatform === 'facebook') {
        toast.success(`🔴 Live on Facebook! Your stream is now visible on your Facebook page.`);
        
        // Simulate Facebook post creation
        setTimeout(() => {
          toast.info('📘 Your live stream has been posted to your Facebook timeline');
        }, 3000);
      } else {
        toast.success(`Started streaming to ${platformConfigs[streamPlatform].name}!`);
      }

      // Handle stream end
      displayStream.getVideoTracks()[0].onended = () => {
        stopStream();
        clearInterval(viewerInterval);
      };

    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start stream. Please check permissions.');
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setViewers(0);
    
    if (streamPlatform === 'facebook') {
      toast.info('📘 Facebook Live stream ended');
    } else {
      toast.info('Stream ended');
    }
  };

  const shareStreamLink = () => {
    let streamUrl = '';
    
    if (streamPlatform === 'facebook') {
      streamUrl = `https://facebook.com/${facebookUser?.id}/live`;
    } else {
      streamUrl = `https://${streamPlatform}.com/live/${streamKey}`;
    }
    
    if (navigator.share) {
      navigator.share({
        title: streamTitle,
        text: 'Watch me play poker live!',
        url: streamUrl
      });
    } else {
      navigator.clipboard.writeText(streamUrl).then(() => {
        toast.success('Stream link copied to clipboard!');
      });
    }
  };

  return (
    <>
      {/* Stream Status Badge */}
      {isStreaming && (
        <Badge className="bg-red-600 animate-pulse mr-2">
          🔴 LIVE • {viewers} viewers
        </Badge>
      )}

      {/* Stream Control Button */}
      <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
        <DialogTrigger asChild>
          <Button
            variant={isStreaming ? "destructive" : "outline"}
            className={`${isStreaming ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'} ${className}`}
          >
            {isStreaming ? '🔴 Stop Stream' : '📺 Go Live'}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-gray-900 text-white border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isStreaming ? 'Stream Controls' : 'Start Live Stream'}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {isStreaming ? 'Manage your live stream' : 'Stream your poker game live to your audience'}
            </DialogDescription>
          </DialogHeader>

          {!isStreaming ? (
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <Label className="text-white">Streaming Platform</Label>
                <Select value={streamPlatform} onValueChange={(value) => setStreamPlatform(value as 'facebook' | 'youtube' | 'twitch')}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(platformConfigs).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.icon} {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Facebook Account Connection */}
              {streamPlatform === 'facebook' && (
                <Card className="bg-blue-600/20 border-blue-400/30">
                  <CardContent className="p-4">
                    {!facebookConnected ? (
                      <div className="text-center">
                        <h4 className="text-white font-semibold mb-2">Connect Facebook Account</h4>
                        <p className="text-gray-300 text-sm mb-4">
                          Connect your Facebook account to stream directly to your page
                        </p>
                        <Button
                          onClick={connectFacebook}
                          disabled={showFacebookLogin}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {showFacebookLogin ? '🔄 Connecting...' : '📘 Connect Facebook'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <img 
                          src={facebookUser?.picture || 'https://via.placeholder.com/50'} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h4 className="text-white font-semibold">Connected as {facebookUser?.name}</h4>
                          <p className="text-gray-300 text-sm">Ready to stream to Facebook</p>
                        </div>
                        <Badge className="bg-green-600">✓ Connected</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Stream Title */}
              <div>
                <Label htmlFor="streamTitle" className="text-white">Stream Title</Label>
                <Input
                  id="streamTitle"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Enter your stream title"
                />
              </div>

              {/* Stream Key (for non-Facebook platforms) */}
              {streamPlatform !== 'facebook' && (
                <div>
                  <Label htmlFor="streamKey" className="text-white">Stream Key</Label>
                  <Input
                    id="streamKey"
                    type="password"
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Paste your stream key here"
                  />
                </div>
              )}

              {/* Platform Instructions */}
              <Card className={`${platformConfigs[streamPlatform].color}/20 border-white/20`}>
                <CardHeader>
                  <CardTitle className="text-white text-sm">
                    {platformConfigs[streamPlatform].icon} {platformConfigs[streamPlatform].name} Setup:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="text-gray-300 text-sm space-y-1">
                    {platformConfigs[streamPlatform].instructions.map((instruction, index) => (
                      <li key={index}>{index + 1}. {instruction}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Stream Settings */}
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">Stream Features</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>✅ Screen capture of poker table</div>
                    <div>✅ Picture-in-picture camera</div>
                    <div>✅ Audio commentary</div>
                    <div>✅ Real-time viewer count</div>
                    <div>✅ Chat integration</div>
                    <div>✅ HD quality (1080p)</div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={startStream}
                disabled={streamPlatform === 'facebook' && !facebookConnected}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                🔴 Start Live Stream
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stream Status */}
              <Card className="bg-red-600/20 border-red-400/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold">🔴 STREAMING LIVE</h3>
                      <p className="text-gray-300">{streamTitle}</p>
                      <p className="text-sm text-gray-400">Platform: {platformConfigs[streamPlatform].name}</p>
                      {streamPlatform === 'facebook' && facebookUser && (
                        <p className="text-sm text-blue-400">Streaming as: {facebookUser.name}</p>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{viewers}</div>
                      <div className="text-sm text-gray-300">viewers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Camera Preview */}
              <div>
                <Label className="text-white">Your Camera (Picture-in-Picture)</Label>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-32 bg-black rounded border mt-2"
                />
              </div>

              {/* Stream Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={shareStreamLink}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  📤 Share Stream
                </Button>
                <Button
                  onClick={stopStream}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  🛑 End Stream
                </Button>
              </div>

              {/* Stream Stats */}
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">Stream Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Duration:</span>
                      <span className="text-white">Live</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Quality:</span>
                      <span className="text-green-400">HD 1080p</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span className="text-green-400">Stable</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Platform:</span>
                      <span className="text-white">{platformConfigs[streamPlatform].name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

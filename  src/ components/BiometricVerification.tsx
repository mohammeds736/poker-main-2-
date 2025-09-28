import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BiometricVerification } from '@/types/poker';

interface BiometricVerificationProps {
  onVerificationComplete: (result: BiometricVerification) => void;
  onCancel: () => void;
}

export default function BiometricVerificationComponent({ onVerificationComplete, onCancel }: BiometricVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [verification, setVerification] = useState<BiometricVerification>({
    faceDetected: false,
    faceMatched: false,
    confidence: 0,
    landmarks: [],
    expressions: {},
    verificationSteps: {
      lookLeft: false,
      lookRight: false,
      lookUp: false,
      lookDown: false,
      blink: false
    }
  });

  const steps = [
    { id: 'center', instruction: 'Look directly at the camera', icon: '👁️' },
    { id: 'left', instruction: 'Look to the left', icon: '👈' },
    { id: 'right', instruction: 'Look to the right', icon: '👉' },
    { id: 'up', instruction: 'Look up', icon: '👆' },
    { id: 'down', instruction: 'Look down', icon: '👇' },
    { id: 'blink', instruction: 'Blink twice', icon: '😉' }
  ];

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
  };

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      console.log('Requesting camera access...');
      
      // Request camera with simpler constraints
      const constraints = {
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user'
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Handle video events
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Video playing successfully');
                setIsLoading(false);
                setCameraError(null);
                setStream(mediaStream);
                startVerificationProcess();
              })
              .catch((error) => {
                console.error('Error playing video:', error);
                setCameraError('Failed to start video playback');
                setIsLoading(false);
              });
          }
        };

        videoRef.current.onerror = (error) => {
          console.error('Video error:', error);
          setCameraError('Video playback error');
          setIsLoading(false);
        };
      }

    } catch (error) {
      console.error('Camera access error:', error);
      
      let errorMessage = 'Camera access denied or not available';
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera access denied. Please allow camera access and try again.';
            break;
          case 'NotFoundError':
            errorMessage = 'No camera found. Please connect a camera and try again.';
            break;
          case 'NotReadableError':
            errorMessage = 'Camera is already in use by another application.';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Camera does not support the required settings.';
            break;
          default:
            errorMessage = error.message || 'Unknown camera error';
        }
      }
      
      setCameraError(errorMessage);
      setIsLoading(false);
    }
  };

  const startVerificationProcess = () => {
    console.log('Starting verification process...');
    
    // Start face detection simulation
    const detectionInterval = setInterval(() => {
      simulateFaceDetection();
    }, 500);

    // Auto-progress through verification steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= steps.length) {
          clearInterval(stepInterval);
          clearInterval(detectionInterval);
          completeVerification();
          return prev;
        }
        
        // Update verification steps
        const stepId = steps[prev].id;
        setVerification(prevVerification => ({
          ...prevVerification,
          verificationSteps: {
            ...prevVerification.verificationSteps,
            [stepId === 'left' ? 'lookLeft' : 
             stepId === 'right' ? 'lookRight' :
             stepId === 'up' ? 'lookUp' :
             stepId === 'down' ? 'lookDown' :
             stepId === 'blink' ? 'blink' : 'lookLeft']: true
          }
        }));

        setProgress((nextStep / steps.length) * 100);
        return nextStep;
      });
    }, 2000); // 2 seconds per step

    return () => {
      clearInterval(detectionInterval);
      clearInterval(stepInterval);
    };
  };

  const simulateFaceDetection = () => {
    // Simulate realistic face detection results
    const faceDetected = Math.random() > 0.1; // 90% chance of face detection
    const confidence = faceDetected ? 0.85 + Math.random() * 0.15 : 0;

    setVerification(prev => ({
      ...prev,
      faceDetected,
      confidence,
      faceMatched: confidence > 0.8,
      landmarks: faceDetected ? generateRandomLandmarks() : [],
      expressions: faceDetected ? generateRandomExpressions() : {}
    }));

    // Draw detection overlay on canvas
    if (canvasRef.current && videoRef.current && faceDetected) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw face bounding box
        const boxWidth = 200;
        const boxHeight = 250;
        const x = (canvas.width - boxWidth) / 2;
        const y = (canvas.height - boxHeight) / 2;
        
        ctx.strokeStyle = confidence > 0.8 ? '#00ff00' : '#ffff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, boxWidth, boxHeight);
        
        // Draw confidence text
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText(`Confidence: ${(confidence * 100).toFixed(1)}%`, x, y - 10);
        
        // Draw corner markers
        const cornerSize = 20;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4;
        
        // Draw all four corners
        [
          [x, y, x + cornerSize, y, x, y + cornerSize],
          [x + boxWidth - cornerSize, y, x + boxWidth, y, x + boxWidth, y + cornerSize],
          [x, y + boxHeight - cornerSize, x, y + boxHeight, x + cornerSize, y + boxHeight],
          [x + boxWidth - cornerSize, y + boxHeight, x + boxWidth, y + boxHeight, x + boxWidth, y + boxHeight - cornerSize]
        ].forEach(([x1, y1, x2, y2, x3, y3]) => {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          ctx.stroke();
        });
      }
    }
  };

  const generateRandomLandmarks = (): number[][] => {
    const landmarks: number[][] = [];
    for (let i = 0; i < 68; i++) {
      landmarks.push([
        Math.random() * 640,
        Math.random() * 480
      ]);
    }
    return landmarks;
  };

  const generateRandomExpressions = (): Record<string, number> => {
    return {
      neutral: 0.7 + Math.random() * 0.3,
      happy: Math.random() * 0.3,
      sad: Math.random() * 0.2,
      angry: Math.random() * 0.1,
      surprised: Math.random() * 0.2,
      disgusted: Math.random() * 0.1,
      fearful: Math.random() * 0.1
    };
  };

  const completeVerification = () => {
    const finalVerification: BiometricVerification = {
      ...verification,
      faceMatched: true,
      confidence: 0.94,
      verificationSteps: {
        lookLeft: true,
        lookRight: true,
        lookUp: true,
        lookDown: true,
        blink: true
      }
    };

    setTimeout(() => {
      cleanup();
      onVerificationComplete(finalVerification);
    }, 1000);
  };

  const skipVerification = () => {
    const demoVerification: BiometricVerification = {
      faceDetected: true,
      faceMatched: true,
      confidence: 0.90,
      landmarks: [],
      expressions: {},
      verificationSteps: {
        lookLeft: true,
        lookRight: true,
        lookUp: true,
        lookDown: true,
        blink: true
      }
    };
    
    cleanup();
    onVerificationComplete(demoVerification);
  };

  const retryCamera = () => {
    cleanup();
    initializeCamera();
  };

  if (cameraError) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4 text-red-400">📷</div>
          <h3 className="text-xl font-bold text-white mb-4">Camera Access Issue</h3>
          <p className="text-gray-300 mb-6">{cameraError}</p>
          <div className="space-y-4">
            <Button
              onClick={retryCamera}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 mr-4"
            >
              🔄 Retry Camera
            </Button>
            <Button
              onClick={skipVerification}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 mr-4"
            >
              ⏭️ Skip Verification
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              ❌ Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardContent className="p-8 text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <h3 className="text-xl font-bold text-white mb-4">Initializing Camera</h3>
          <p className="text-gray-300 mb-4">Please allow camera access when prompted</p>
          <Progress value={30} className="mb-4" />
          <div className="space-y-2">
            <Button
              onClick={skipVerification}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 mr-4"
            >
              ⏭️ Skip Verification
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
            >
              ❌ Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">🔐 Biometric Verification</CardTitle>
          <CardDescription className="text-gray-300 text-center">
            Follow the instructions to complete identity verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera View */}
          <div className="relative mx-auto w-fit">
            <video
              ref={videoRef}
              className="rounded-lg border-4 border-yellow-400"
              width="640"
              height="480"
              autoPlay
              muted
              playsInline
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-none rounded-lg"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* Status Overlay */}
            <div className="absolute top-4 left-4 space-y-2">
              <Badge className={`${verification.faceDetected ? 'bg-green-600' : 'bg-red-600'}`}>
                {verification.faceDetected ? '✅ Face Detected' : '❌ No Face'}
              </Badge>
              {verification.faceDetected && (
                <Badge className={`${verification.confidence > 0.8 ? 'bg-green-600' : 'bg-yellow-600'}`}>
                  Accuracy: {(verification.confidence * 100).toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>

          {/* Current Step */}
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce">
              {steps[currentStep]?.icon || '👁️'}
            </div>
            <h3 className="text-2xl font-bold text-white">
              {steps[currentStep]?.instruction || 'Look directly at the camera'}
            </h3>
            
            {/* Progress */}
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-gray-300">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>

          {/* Verification Steps Status */}
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(verification.verificationSteps).map(([step, completed]) => (
              <div
                key={step}
                className={`p-2 rounded text-center text-sm ${
                  completed ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                {completed ? '✅' : '⭕'}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 justify-center">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              ❌ Cancel
            </Button>
            <Button
              onClick={skipVerification}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
            >
              ⏭️ Skip (Demo)
            </Button>
            {currentStep >= steps.length && (
              <Button
                onClick={completeVerification}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                ✅ Complete Verification
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

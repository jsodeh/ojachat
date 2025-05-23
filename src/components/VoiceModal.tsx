import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X } from "lucide-react";
import { useElevenLabs } from '@/providers/ElevenLabsProvider';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthWrapper } from '@/components/AuthWrapper';

// Placeholder logo SVG (replace with your actual logo if available)
const Logo = () => (
  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white relative shadow-lg">
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="10" fill="#3B82F6" />
      <circle cx="11" cy="11" r="6" fill="#fff" />
      <circle cx="11" cy="11" r="3" fill="#6366F1" />
    </svg>
    <div className="absolute inset-0 rounded-full pointer-events-none" style={{
      boxShadow: '0 0 8px 3px #60a5fa, 0 0 16px 6px #6366f1',
      opacity: 0.7
    }} />
  </div>
);

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

const VoiceModal = ({ isOpen, onClose, onTranscript }: VoiceModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const { startAgentSession, stopAgentSession } = useElevenLabs();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  
  // Get authentication state
  const { isAuthenticated } = useAuth();
  const authWrapper = useAuthWrapper();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      if (isRecording) {
        setupVisualizer();
      } else {
        // Draw initial static visualization
        drawInitialVisualizer();
      }
    }
  }, [isOpen, isRecording]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle modal close - show FAB if recording is active
  useEffect(() => {
    if (!isOpen && isRecording) {
      setShowFAB(true);
    } else {
      setShowFAB(false);
    }
  }, [isOpen, isRecording]);

  const setupAudioContext = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone not supported in this browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // Set analyzer properties - improved for better responsiveness
      analyserRef.current.smoothingTimeConstant = 0.4;  // reduced from 0.6 for faster response
      analyserRef.current.fftSize = 512;               // increased from 256 for better resolution
      analyserRef.current.minDecibels = -85;           // lowered to pick up more subtle sounds
      analyserRef.current.maxDecibels = -10;           // adjusted for better dynamic range
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      if (canvasRef.current) {
        visualize();
      }
    } catch (error: any) {
      setMicError(error.message || 'Failed to access microphone.');
      toast({
        title: "Microphone Error",
        description: error.message || 'Failed to access microphone.',
        variant: "destructive"
      });
      setIsRecording(false);
      throw error;
    }
  };

  const handleStartRecording = async () => {
    // Check if user is authenticated before starting recording
    if (!isAuthenticated) {
      // Close the modal and show auth modal
      onClose();
      authWrapper.showAuthModal();
      return;
    }
    
    setMicError(null);
    setIsRecording(true);
    try {
      await setupAudioContext();
      await startAgentSession({
        onConnect: () => {},
        onDisconnect: () => {},
        onError: (err) => { 
          console.error(err);
          toast({
            title: "Connection Error",
            description: "Failed to connect to voice service. Please try again.",
            variant: "destructive"
          });
        },
        onModeChange: () => {},
        onTranscription: (text) => {
          onTranscript(text);
        },
        onResponse: (text) => {
          setAgentResponse(text);
        },
      });
    } catch (error) {
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    try {
      await stopAgentSession();
    } catch (error) {
      console.error('Error stopping agent session:', error);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowFAB(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await handleStopRecording();
    } else {
      await handleStartRecording();
    }
  };

  const setupVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
  };

  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    // Create frequency data array
    const freqData = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const draw = () => {
      if (!analyserRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      
      // Get frequency data
      analyserRef.current.getByteFrequencyData(freqData);
      
      // Clear canvas
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      
      // Draw visualization
      drawVisualizer(ctx, freqData, WIDTH, HEIGHT);
    };
    
    draw();
  };
  
  const drawVisualizer = (ctx: CanvasRenderingContext2D, freqData: Uint8Array, width: number, height: number) => {
    const m = height / 2; // the vertical middle of the canvas
    
    // Define colors with more varied green shades including blackish-green
    const colors = [
      [18, 67, 32],    // dark blackish green
      [25, 97, 39],    // darker green
      [46, 139, 87],   // sea green
      [85, 239, 196]   // light green (existing)
    ];
    
    // Options with improved responsiveness parameters
    const opts = {
      fillOpacity: 0.8,
      lineWidth: 1.5,
      glow: 15,
      width: width / 20,
      amp: 2.5         // increased amplitude for more pronounced visualization
    };
    
    // Draw four curves in different green shades
    for (let channel = 0; channel < colors.length; channel++) {
      const color = colors[channel];
      
      // Set styles
      ctx.fillStyle = `rgba(${color}, ${opts.fillOpacity})`;
      ctx.strokeStyle = ctx.shadowColor = `rgb(${color})`;
      ctx.lineWidth = opts.lineWidth;
      ctx.shadowBlur = opts.glow;
      ctx.globalCompositeOperation = 'screen';
      
      // Path drawing
      ctx.beginPath();
      
      // For the path, use more data points from the frequency array for better responsiveness
      const dataPoints = 8;  // increased from 5
      const step = Math.floor(freqData.length / dataPoints);
      
      // Create path control points
      const xPoints = Array(15).fill(0).map((_, i) => (width / 15) * i);
      
      // Get y values from frequency data with enhanced responsiveness
      const yValues = Array(dataPoints).fill(0).map((_, i) => {
        const freqIndex = i * step;
        const scaleFactor = 1 - Math.abs(2 - i) / 4; // Scale to make center bigger
        return Math.max(10, m - (freqData[freqIndex] / 255) * m * scaleFactor * opts.amp);
      });
      
      ctx.moveTo(0, m);
      ctx.lineTo(xPoints[0], m);
      
      // Top curves
      ctx.bezierCurveTo(xPoints[1], m, xPoints[2], yValues[0], xPoints[3], yValues[0]);
      ctx.bezierCurveTo(xPoints[4], yValues[0], xPoints[4], yValues[1], xPoints[5], yValues[1]);
      ctx.bezierCurveTo(xPoints[6], yValues[1], xPoints[6], yValues[2], xPoints[7], yValues[2]);
      ctx.bezierCurveTo(xPoints[8], yValues[2], xPoints[8], yValues[3], xPoints[9], yValues[3]);
      ctx.bezierCurveTo(xPoints[10], yValues[3], xPoints[10], yValues[4], xPoints[11], yValues[4]);
      ctx.bezierCurveTo(xPoints[12], yValues[4], xPoints[12], m, xPoints[13], m);
      
      ctx.lineTo(width, m);
      ctx.lineTo(xPoints[13], m);
      
      // Bottom curves (mirror of top)
      ctx.bezierCurveTo(xPoints[12], m, xPoints[12], height - yValues[4], xPoints[11], height - yValues[4]);
      ctx.bezierCurveTo(xPoints[10], height - yValues[4], xPoints[10], height - yValues[3], xPoints[9], height - yValues[3]);
      ctx.bezierCurveTo(xPoints[8], height - yValues[3], xPoints[8], height - yValues[2], xPoints[7], height - yValues[2]);
      ctx.bezierCurveTo(xPoints[6], height - yValues[2], xPoints[6], height - yValues[1], xPoints[5], height - yValues[1]);
      ctx.bezierCurveTo(xPoints[4], height - yValues[1], xPoints[4], height - yValues[0], xPoints[3], height - yValues[0]);
      ctx.bezierCurveTo(xPoints[2], height - yValues[0], xPoints[1], m, xPoints[0], m);
      
      ctx.lineTo(0, m);
      ctx.fill();
      ctx.stroke();
    }
  };

  const drawInitialVisualizer = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    // Create some default low-amplitude frequency data
    const fakeFreqData = new Uint8Array(128);
    for (let i = 0; i < fakeFreqData.length; i++) {
      fakeFreqData[i] = 20 + Math.sin(i / 10) * 10; // Low amplitude sine wave pattern
    }
    
    // Clear canvas and set background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw visualization with fake data
    drawVisualizer(ctx, fakeFreqData, WIDTH, HEIGHT);
  };

  const handleModalClose = () => {
    if (isRecording) {
      setShowFAB(true);
    }
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent
          className="w-full max-w-[320px] p-0 overflow-hidden rounded-2xl bg-black text-white border-0 shadow-2xl flex flex-col relative"
          style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <DialogTitle className="sr-only">Voice Assistant</DialogTitle>
          <DialogDescription className="sr-only">
            Use this modal to interact with the voice assistant.
          </DialogDescription>
          
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleModalClose}
            className="absolute top-2 right-2 z-10 text-white/70 hover:text-white"
            aria-label="Close voice assistant"
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Header with logo and label */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2 px-2 py-1">
            <Logo />
            <span className="font-semibold text-sm text-white">Sarah</span>
          </div>
          
          {/* Audio visualizer canvas - fills entire modal */}
          <div className="w-full h-[240px] overflow-hidden">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full"
            />
          </div>
          
          {/* Microphone button overlaid on the center of the canvas - reduced size */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRecording}
              className={`w-12 h-12 rounded-full shadow-lg bg-white border border-gray-200 flex items-center justify-center transition-colors duration-200 ${
                isRecording ? 'ring-2 ring-green-400' : ''
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5 text-green-600" />
              ) : (
                <Mic className="h-5 w-5 text-green-600" />
              )}
            </Button>
          </div>
          
          {/* Hidden error message only shown when there's an error */}
          {micError && (
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <p className="text-xs text-red-400">{micError}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Floating Action Button for rejoining voice conversation */}
      {showFAB && (
        <div 
          className="fixed right-4 bottom-20 z-50"
          onClick={() => {
            setShowFAB(false);
            onClose();
          }}
        >
          <Button 
            className="w-12 h-12 rounded-full shadow-lg bg-green-500 border-0 flex items-center justify-center text-white hover:bg-green-600"
          >
            <Mic className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  );
};

export default VoiceModal; 
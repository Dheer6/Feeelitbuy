import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, Camera, X } from 'lucide-react';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  onScan: (qrCode: string) => void;
  onClose: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const scanIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const isScanningRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    startCamera();
    
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });

      if (!isMountedRef.current) {
        // Component unmounted, stop the stream immediately
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        isScanningRef.current = true;
        startScanning();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please grant camera permissions.');
      setManualMode(true); // Auto-switch to manual mode if camera fails
    }
  };

  const stopCamera = () => {
    setScanning(false);
    isScanningRef.current = false;
    
    // Stop animation frame
    if (scanIntervalRef.current) {
      cancelAnimationFrame(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startScanning = () => {
    const scan = () => {
      if (!isMountedRef.current || !isScanningRef.current) {
        return;
      }

      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            console.log('QR Code detected:', code.data);
            stopCamera();
            onScan(code.data);
            return;
          }
        }
      }

      scanIntervalRef.current = requestAnimationFrame(scan);
    };

    scan();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      stopCamera();
      onScan(manualCode.trim());
    }
  };

  return (
    <div className="space-y-4">
      {!manualMode ? (
        <>
          {error ? (
            <div className="flex flex-col items-center gap-4 p-4 bg-destructive/10 text-destructive rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setManualMode(true)}
                className="w-full"
              >
                Enter QR Code Manually
              </Button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-4 border-primary rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
              </div>

              {scanning && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <Camera className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Scanning...</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setManualMode(true)}
              className="flex-1"
            >
              Enter Manually
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="font-semibold mb-2">Manual Entry</h3>
            <p className="text-sm text-muted-foreground">
              Enter the QR code from the delivery package
            </p>
          </div>

          <div>
            <Label htmlFor="qrCode">QR Code</Label>
            <Input
              id="qrCode"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="DEL-12345678-..."
              required
              className="font-mono"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: DEL-[order-id]-[timestamp]-[random]
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setManualMode(false);
                setManualCode('');
                if (!scanning && !error) {
                  startCamera();
                }
              }}
              className="flex-1"
            >
              Back to Scanner
            </Button>
            <Button type="submit" className="flex-1">
              Submit
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

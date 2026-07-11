'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  label?: string;
  showSideBySide?: boolean;
  comparisonImage?: string | null;
}

export function CameraCapture({
  onCapture,
  label = 'Capture Photo',
  showSideBySide = false,
  comparisonImage,
}: CameraCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch {
      // Fallback to file upload
      fileInputRef.current?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      onCapture(file, url);
      stopCamera();
    }, 'image/jpeg', 0.95);
  }, [onCapture, stopCamera]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      onCapture(file, url);
    },
    [onCapture]
  );

  const retake = useCallback(() => {
    setPreview(null);
    startCamera();
  }, [startCamera]);

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {isCameraOpen ? (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-80 w-full object-cover"
            />
            {/* Alignment guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-lg border-2 border-dashed border-white/50" />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={capturePhoto}>
              <Camera className="mr-2 h-5 w-5" />
              Capture
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              Cancel
            </Button>
          </div>
        </div>
      ) : preview ? (
        <div className="space-y-4">
          {showSideBySide && comparisonImage ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-center text-xs text-gray-500">Before</p>
                <img
                  src={comparisonImage}
                  alt="Before"
                  className="h-48 w-full rounded-lg object-cover"
                />
              </div>
              <div>
                <p className="mb-1 text-center text-xs text-gray-500">After</p>
                <img
                  src={preview}
                  alt="After"
                  className="h-48 w-full rounded-lg object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <img
                src={preview}
                alt="Captured"
                className="h-64 w-full object-contain"
              />
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={retake}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {showSideByCase && comparisonImage && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="mb-2 text-center text-xs text-gray-500">Before Image</p>
              <img
                src={comparisonImage}
                alt="Before"
                className="h-48 w-full rounded-lg object-cover"
              />
            </div>
          )}

          <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
            <Camera className="h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Position the target within the frame and capture
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={startCamera}>
              <Camera className="mr-2 h-5 w-5" />
              {label}
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Fix unused variable warning
const showSideByCase = false;
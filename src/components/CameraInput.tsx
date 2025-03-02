import React, { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from './ui/Button';
import Tesseract from 'tesseract.js';

interface CameraInputProps {
  onCapture: (text: string) => void;
  onError?: (error: string) => void;
}

export function CameraInput({ onCapture, onError }: CameraInputProps) {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      if (onError) onError('No se pudo acceder a la cámara');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Capturar frame actual
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    try {
      setIsProcessing(true);
      
      // Procesar imagen con Tesseract
      const result = await Tesseract.recognize(
        canvas.toDataURL('image/jpeg'),
        'spa',
        {
          logger: m => console.log(m)
        }
      );

      onCapture(result.data.text);
      stopCamera();
    } catch (err) {
      if (onError) onError('Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isActive ? (
        <Button variant="secondary" onClick={startCamera}>
          <Camera className="h-4 w-4 mr-2" />
          Usar Cámara
        </Button>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <Button
              variant="secondary"
              onClick={stopCamera}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={captureImage}
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Capturar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

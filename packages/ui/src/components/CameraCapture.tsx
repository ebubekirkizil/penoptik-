// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 } 
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setError("");
      setHasStarted(true);
    } catch (err: any) {
      console.error(err);
      setError("Kameraya erişilemedi. Lütfen tarayıcı izinlerini kontrol edin.");
      setHasStarted(true);
    }
  };

  // We don't auto-start on mount to prevent browser blocking without user gesture
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Draw the current video frame onto the canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert to a File object
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
      onCapture(file);
      
      // Stop the stream after capturing
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center min-h-[400px] border border-border-color shadow-2xl">
      {!hasStarted ? (
        <div className="text-center p-6 text-white space-y-4">
          <div className="w-20 h-20 bg-primary/20 text-primary flex items-center justify-center rounded-full mx-auto mb-4 glow-primary">
            <Camera className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold">Kamera Erişimi</h3>
          <p className="text-white/70 text-sm max-w-xs mx-auto">
            Reçete fotoğrafı çekebilmek için kameranızı açmanız gerekiyor.
          </p>
          <button 
            type="button"
            onClick={startCamera} 
            className="gradient-primary text-[#1B242A] px-6 py-3 rounded-xl transition-all flex items-center gap-2 mx-auto font-bold mt-4 glow-primary hover:scale-105"
          >
            <Camera className="w-5 h-5" /> Kamerayı Aç ve İzin Ver
          </button>
          <button 
            type="button"
            onClick={onCancel} 
            className="text-white/70 hover:text-white text-sm block mx-auto mt-4 underline"
          >
            Vazgeç
          </button>
        </div>
      ) : error ? (
        <div className="text-center p-6 text-white space-y-4">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 flex items-center justify-center rounded-full mx-auto mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <p className="text-red-400 font-semibold">{error}</p>
          <div className="text-white/80 text-sm max-w-sm mx-auto bg-white/5 p-4 rounded-xl border border-white/10 text-left space-y-2">
            <p><strong>Nasıl izin verilir?</strong></p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Tarayıcınızın adres çubuğundaki <strong>Kilit (🔒)</strong> ikonuna tıklayın.</li>
              <li>Açılan menüden <strong>Site Ayarları</strong>'na girin veya doğrudan <strong>Kamera</strong> iznini bulun.</li>
              <li>İzni <strong>"İzin Ver" (Allow)</strong> olarak değiştirin.</li>
              <li>Aşağıdaki butona basarak tekrar deneyin.</li>
            </ol>
          </div>
          <button 
            type="button"
            onClick={startCamera} 
            className="bg-primary hover:bg-primary/90 text-[#1B242A] px-5 py-3 rounded-xl transition-all flex items-center gap-2 mx-auto font-bold mt-4"
          >
            <RefreshCw className="w-5 h-5" /> İzni Verdim, Tekrar Dene
          </button>
          <button 
            type="button"
            onClick={onCancel} 
            className="text-white/70 hover:text-white text-sm block mx-auto mt-4 underline"
          >
            İptal Et
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-h-[500px] object-contain bg-black"
          />
          
          <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={onCancel}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white p-4 rounded-full transition-all flex-shrink-0"
              title="İptal"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="w-20 h-20 bg-white rounded-full border-4 border-primary shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              title="Fotoğraf Çek"
            >
              <Camera className="w-8 h-8 text-[#1B242A]" />
            </button>
          </div>
          
          <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
             <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white/90 text-xs font-semibold tracking-wider">
               CANLI KAMERA
             </div>
          </div>
        </>
      )}
    </div>
  );
}

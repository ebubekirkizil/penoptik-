"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Check, X, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface VoiceAssistantWidgetProps {
  onDataParsed?: (parsedData: any) => void;
}

export function VoiceAssistantWidget({ onDataParsed }: VoiceAssistantWidgetProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 120; // 2 minutes in seconds

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setParsedData(null);
    } catch (error) {
      console.error("Microphone access denied:", error);
      toast.error("Mikrofon erişimine izin vermeniz gerekiyor.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all audio tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStop = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setIsProcessing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice-command.webm");

    try {
      const response = await fetch("/api/ai/voice", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "İşlem başarısız oldu");
      }

      setParsedData(result.data);
      if (onDataParsed) {
        onDataParsed(result.data);
      }
      
    } catch (error: any) {
      console.error("Error processing voice:", error);
      toast.error(error.message || "Ses işlenirken bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-4">
      {/* Processing State */}
      {isProcessing && (
        <div className="bg-surface/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 flex items-center gap-3 border border-border-color animate-in slide-in-from-bottom-5">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <div className="text-sm">
            <p className="font-bold text-foreground">Yapay Zeka Dinliyor...</p>
            <p className="text-xs text-muted-foreground">Ses analiz ediliyor ve forma dönüştürülüyor</p>
          </div>
        </div>
      )}

      {/* Result Modal (Mini View) */}
      {parsedData && !isProcessing && (
        <div className="bg-surface/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 w-72 border border-border-color animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" /> Yapay Zeka Özeti
            </h4>
            <button onClick={() => setParsedData(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
            {parsedData.customer?.firstName && (
              <p><span className="text-muted-foreground">Müşteri:</span> <span className="font-medium">{parsedData.customer.firstName} {parsedData.customer.lastName}</span></p>
            )}
            {parsedData.customer?.phone && (
              <p><span className="text-muted-foreground">Telefon:</span> <span className="font-medium">{parsedData.customer.phone}</span></p>
            )}
            {parsedData.order?.totalPrice && (
              <p><span className="text-muted-foreground">Fiyat:</span> <span className="font-medium">{parsedData.order.totalPrice} TL</span></p>
            )}
            {/* Sadece bilgi amaçlı, asıl form doldurma işlemi üst componentte (Layout veya Page) yapılacak */}
          </div>
          <button 
            className="w-full mt-3 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold py-2 rounded-xl transition-colors"
            onClick={() => setParsedData(null)}
          >
            Formu İncele ve Kaydet
          </button>
        </div>
      )}

      {/* Main Microphone Button */}
      <div className="relative group">
        {isRecording && (
          <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping pointer-events-none" />
        )}
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300
            ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed scale-90' : 'hover:scale-105 active:scale-95'}
          `}
        >
          {isRecording ? (
            <Square className="w-6 h-6 text-white fill-current animate-pulse" />
          ) : (
            <Mic className="w-7 h-7 text-primary-foreground" />
          )}
        </button>

        {isRecording && (
          <div className="absolute top-1/2 -translate-y-1/2 right-[120%] bg-surface/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-border-color whitespace-nowrap flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold font-mono text-foreground">{formatTime(recordingTime)}</span>
            <span className="text-xs text-muted-foreground ml-1">/ 2:00</span>
          </div>
        )}
      </div>
    </div>
  );
}

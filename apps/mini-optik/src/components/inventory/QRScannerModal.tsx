"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, RefreshCcw } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader-inventory";

  useEffect(() => {
    if (!isOpen) {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
      return;
    }

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back camera if available
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('arka'));
          const selectedCam = backCamera ? backCamera.id : devices[0].id;
          setActiveCameraId(selectedCam);
          
          const html5QrCode = new Html5Qrcode(scannerContainerId, {
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.CODE_128
            ]
          });
          html5QrCodeRef.current = html5QrCode;

          await html5QrCode.start(
            selectedCam,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                  onScanSuccess(decodedText);
                  onClose();
                }).catch(console.error);
              }
            },
            (errorMessage) => {
              // Ignore scan failures (happens every frame when no QR is found)
            }
          );
        } else {
          setError("Kamera bulunamadı. Lütfen kamera izinlerini kontrol edin.");
        }
      } catch (err) {
        setError("Kameraya erişilemedi. İzin verdiğinizden emin olun.");
        console.error(err);
      }
    };

    // Small delay to ensure modal is rendered
    setTimeout(startScanner, 300);

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  const switchCamera = async () => {
    if (cameras.length < 2 || !html5QrCodeRef.current || !activeCameraId) return;
    
    try {
      await html5QrCodeRef.current.stop();
      const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCam = cameras[nextIndex].id;
      setActiveCameraId(nextCam);

      await html5QrCodeRef.current.start(
        nextCam,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (html5QrCodeRef.current?.isScanning) {
            html5QrCodeRef.current.stop().then(() => {
              onScanSuccess(decodedText);
              onClose();
            });
          }
        },
        (errorMessage) => {}
      );
    } catch (error) {
      console.error("Error switching camera", error);
    }
  };

  const handleClose = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.error("Error stopping scanner on close:", e);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" /> 
            QR ile Hızlı Ekle
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error ? (
            <div className="text-center p-6 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-2xl">
              <p className="font-medium">{error}</p>
            </div>
          ) : (
            <div className="relative">
              <div 
                id={scannerContainerId} 
                className="w-full overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-black aspect-square"
              ></div>
              
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Decorative scanning overlay could go here */}
                <div className="w-64 h-64 border-2 border-blue-500/50 rounded-xl"></div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ürün etiketindeki QR kodu veya barkodu kameraya gösterin.
            </p>
            {cameras.length > 1 && (
              <button 
                onClick={switchCamera}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                <RefreshCcw className="w-4 h-4" /> Çevir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

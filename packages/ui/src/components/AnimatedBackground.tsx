"use client";

import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Yalnızca mouse hareketlerinde çalışsın (mobil için dokunma takibi ekleyebiliriz ama genelde mouse takip yeterli)
    const handleMouseMove = (e: MouseEvent) => {
      // requestAnimationFrame ile performansı optimize edebiliriz ama bu basit kullanım için yeterli
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Sunucu tarafında render edilmesini engelle (hydration hatası olmaması için)
  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Yavaş hareket eden statik arka plan animasyonları */}
      <div 
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 animate-pulse"
        style={{ background: "radial-gradient(circle, rgba(92,156,168,0.4) 0%, transparent 70%)", animationDuration: "12s" }} 
      />
      <div 
        className="absolute top-1/4 -right-40 w-[800px] h-[800px] rounded-full opacity-20 animate-pulse"
        style={{ background: "radial-gradient(circle, rgba(197,155,93,0.3) 0%, transparent 70%)", animationDuration: "18s", animationDelay: "2s" }} 
      />
      <div 
        className="absolute -bottom-40 left-1/3 w-[1000px] h-[1000px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(92,156,168,0.2) 0%, transparent 60%)" }} 
      />

      {/* Fareyi (Mouse) takip eden parlama efekti */}
      <div 
        className="absolute rounded-full pointer-events-none ease-out opacity-60"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(197,155,93,0.25) 0%, transparent 70%)",
          transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`,
          left: 0,
          top: 0,
          transition: "transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)" // Pürüzsüz takip efekti
        }}
      />
    </div>
  );
}

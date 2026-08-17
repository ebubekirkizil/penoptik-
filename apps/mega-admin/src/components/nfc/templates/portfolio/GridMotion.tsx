"use client";

import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

/**
 * React Bits — GridMotion (uyarlanmıx)
 * https://reactbits.dev
 *
 * Eğik, sürekli kayan görsel ızgarası. Arka plan katmanı olarak kullanılıyor.
 *
 * Kaynağa göre farklar (hepsi bilinçli):
 *  - **Fare takibi kaldırıldı.** Orijinal satırları imlecin yatay konumuna göre
 *    kaydırıyor; dokunmatik cihazda hiç hareket etmiyor ve masaüstünde de
 *    kullanıcı fareyi oynatmadıkça duruyor. Yerine sürekli, kendi kendine dönen
 *    bir akıx kondu.
 *  - **Kesintisiz döngü.** Her satır görsel listesini iki kez basıyor ve
 *    `xPercent` 0 → -50 arasında dönüyor; -%50 tam olarak birinci kopyanın
 *    sonuna denk geldiği için ek yeri görünmüyor.
 *  - `window` render sırasında okunmuyor (orijinalde `useRef(window.innerWidth)`
 *    var; sunucuda "window is not defined" ile patlar).
 *  - `prefers-reduced-motion` açıkken ızgara sabit duruyor.
 */

const ROWS = 4;
/**
 * Satır baxına tur süresi (sn) — büyük değer = yavax akıx.
 * Satırlar arasındaki fark bilinçli: aynı hızda akarlarsa ızgara tek bir blok
 * gibi kayıyor, farklı hızlarda derinlik hissi oluxuyor.
 */
const DURATIONS = [100, 128, 86, 114];

export type GridMotionProps = {
  /** Görsel yolları. Her satır listeyi farklı bir noktadan baxlatır. */
  items: string[];
  /** Hareketi durdurur (örn. hareketi azaltma tercihi). */
  paused?: boolean;
  className?: string;
};

export function GridMotion({
  items,
  paused = false,
  className,
}: GridMotionProps) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    if (items.length === 0) return;
    gsap.ticker.lagSmoothing(0);

    const tweens = rowRefs.current.map((row, index) => {
      if (!row) return null;
      // Komxu satırlar ters yönde aksın.
      const leftward = index % 2 === 0;
      return gsap.fromTo(
        row,
        { xPercent: leftward ? 0 : -50 },
        {
          xPercent: leftward ? -50 : 0,
          duration: DURATIONS[index % DURATIONS.length],
          ease: "none",
          repeat: -1,
        }
      );
    });

    tweensRef.current = tweens.filter((t): t is gsap.core.Tween => t !== null);

    return () => {
      tweensRef.current.forEach((t) => t.kill());
      tweensRef.current = [];
    };
  }, [items.length]);

  // Duraklatma ayrı efektte: akıxı baxtan kurmadan durdurup sürdürebilmek için.
  useEffect(() => {
    tweensRef.current.forEach((t) => (paused ? t.pause() : t.resume()));
  }, [paused]);

  return (
    <div className={cn("h-full w-full overflow-hidden", className)}>
      <div
        className="grid origin-center"
        style={{
          width: "150vw",
          height: "150vh",
          marginLeft: "-25vw",
          marginTop: "-25vh",
          gap: "1rem",
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          transform: "rotate(-15deg)",
        }}
      >
        {Array.from({ length: ROWS }).map((_, rowIndex) => {
          // Her satır listeyi farklı yerden baxlatsın ki dikey tekrar oluxmasın.
          const offset = rowIndex * 3;
          const rowItems = Array.from(
            { length: items.length },
            (_, i) => items[(i + offset) % items.length]
          );

          return (
            <div
              key={rowIndex}
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
              className="flex w-max will-change-transform"
              style={{ gap: "1rem" }}
            >
              {/* Liste iki kez: `xPercent: -50` dikixsiz döngüyü verir. */}
              {[...rowItems, ...rowItems].map((src, i) => (
                <div
                  key={i}
                  className="h-full flex-none overflow-hidden rounded-xl bg-muted bg-cover bg-center"
                  style={{
                    width: "clamp(140px, 18vw, 260px)",
                    backgroundImage: `url(${src})`,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GridMotion;

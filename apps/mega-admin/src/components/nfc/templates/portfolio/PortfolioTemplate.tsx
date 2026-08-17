"use client";

import { LinkCard } from "./LinkCard";
// If ModeToggle or SiteFooter are not found in the same folder, adjust later.
// We'll remove ModeToggle for now or replace it if needed, but let's keep it if we can.
import { GridMotion } from "./GridMotion";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/** Arka plandaki ızgarayı dolduran görseller (public/homes). */
const HOME_PHOTOS = Array.from(
  { length: 14 },
  (_, i) => `https://images.unsplash.com/photo-${[
    '1618005182384-a83a8bd57fbe', '1579546929518-9e396f3cc809', '1550684848-fac1c5b4e853',
    '1634017839464-5c339ebe3cb4', '1604871000636-074fa5117945', '1486406146926-c627a92ad1ab',
    '1503387762-592deb58ef4e', '1497366216548-37526070297c', '1505751172876-fa1923c5c528',
    '1538108149393-fbbd81895907', '1518770660439-4636190af475', '1550751827-4bd374c3f58b',
    '1589829085413-56de8ae18c73', '1454165804606-c3d57bc86b40'
  ][i]}?w=600&q=80`
);

/** Profil fotoğrafının çapı (px). Rozetler bundan türetilir. */
const AVATAR_SIZE = 128;
const BADGE_SIZE = 32;
const BADGE_ICON_SIZE = 16;
const RADIUS = AVATAR_SIZE / 2;
const DIAGONAL = RADIUS * Math.SQRT1_2;
const NE = { left: RADIUS + DIAGONAL, top: RADIUS - DIAGONAL };
const SE = { left: RADIUS + DIAGONAL, top: RADIUS + DIAGONAL };

const BADGE_CLASS =
  "absolute flex items-center justify-center rounded-full border-2 border-border bg-background shadow-sm ring-2 ring-background";

const badgeStyle = (point: { left: number; top: number }) => ({
  left: point.left,
  top: point.top,
  width: BADGE_SIZE,
  height: BADGE_SIZE,
  transform: "translate(-50%, -50%)",
});

interface PortfolioTemplateProps {
  profile: {
    name: string;
    title?: string | null;
    companyName?: string | null;
    bio?: string | null;
    profileImage?: string | null;
    themeColor?: string;
  };
  modules: {
    id: string;
    title: string;
    url: string;
    icon?: string | null;
  }[];
}

export default function PortfolioTemplate({ profile, modules }: PortfolioTemplateProps) {
  const reduceMotion = useReducedMotion();
  const initials = profile.name.substring(0, 2).toUpperCase();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.06,
        delayChildren: reduceMotion ? 0 : 0.15,
      },
    },
  };

  const item: Variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
      }
    : {
        hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.4, ease: "easeOut" },
        },
      };

  return (
    <>
      <div
        className="pointer-events-none fixed z-0"
        style={{
          top: "calc(-1 * env(safe-area-inset-top, 0px))",
          left: 0,
          right: 0,
          height:
            "calc(100lvh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <GridMotion items={HOME_PHOTOS} paused={reduceMotion ?? false} />
        <div className="absolute inset-0 bg-background/25 dark:bg-background/40" />
      </div>

      <main
        className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-8 px-6"
        style={{
          paddingTop: "max(4rem, env(safe-area-inset-top))",
          paddingBottom: "max(4rem, env(safe-area-inset-bottom))",
          // Apply theme color indirectly if needed, or rely on CSS vars
        }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="flex w-full flex-col items-center gap-8 rounded-3xl border border-border/60 bg-background/85 p-6 shadow-2xl backdrop-blur-md sm:p-8 dark:bg-background/80"
        >
          <motion.div
            variants={item}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div
              className="relative"
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            >
              <motion.div
                className="group size-full"
                whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                tabIndex={-1}
              >
                <div className="h-full w-full overflow-hidden rounded-full border-2 border-border shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:ring-4 group-hover:ring-emerald-600/30">
                  {profile.profileImage ? (
                    <img
                      alt={profile.name}
                      src={profile.profileImage}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
                      {initials}
                    </div>
                  )}
                </div>

                <span
                  role="img"
                  aria-label="Status"
                  style={{
                    ...badgeStyle(SE),
                    fontSize: BADGE_ICON_SIZE,
                    lineHeight: 1,
                  }}
                  className={BADGE_CLASS}
                >
                  🚀
                </span>
              </motion.div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <h1
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {profile.name}
              </h1>
              <p className="max-w-xs text-balance text-sm text-muted-foreground">
                {profile.bio || profile.title || ""}
              </p>
              {profile.companyName && (
                <div
                  className="mt-1 inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground"
                >
                  <MapPin className="size-3" aria-hidden />
                  {profile.companyName}
                </div>
              )}
            </div>
          </motion.div>

          <ul className="flex w-full flex-col gap-3">
            {modules.map((mod) => (
              <LinkCard key={mod.id} item={{ url: mod.url, label: mod.title, icon: mod.icon || 'Link' }} />
            ))}
          </ul>
        </motion.div>
      </main>
    </>
  );
}

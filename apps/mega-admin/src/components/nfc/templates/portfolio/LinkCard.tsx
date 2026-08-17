"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight, Download, Link as LinkIcon } from "lucide-react";
import { InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon, GitHubIcon } from "@/lib/BrandIcons";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";

export type LinkItem = {
  label: string;
  description?: string;
  href: string;
  icon: string;
  primary?: boolean;
  download?: boolean;
};

const enterVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

function getIcon(name: string) {
  const iconMap: Record<string, any> = {
    instagram: InstagramIcon,
    twitter: XIcon,
    linkedin: LinkedInIcon,
    facebook: LinkIcon, // Facebook icon missing in BrandIcons maybe, fallback
    youtube: YouTubeIcon,
    github: GitHubIcon,
  };
  const key = name.toLowerCase();
  for (const k in iconMap) {
    if (key.includes(k)) return iconMap[k];
  }
  return LinkIcon;
}

export function LinkCard({ item }: { item: LinkItem }) {
  const reduceMotion = useReducedMotion();
  const Icon = getIcon(item.icon);
  const isExternal = item.href.startsWith("http");
  const ArrowIcon = item.download
    ? Download
    : item.primary
      ? ArrowRight
      : ArrowUpRight;

  const Anchor = item.download ? "a" : Link;

  return (
    <motion.li
      variants={reduceMotion ? reducedVariants : enterVariants}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Anchor
        href={item.href}
        download={item.download ? "" : undefined}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={cn(
          "group flex h-14 w-full items-center gap-3 rounded-xl border px-4",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          item.primary
            ? "border-emerald-700 bg-emerald-700 text-white shadow-sm hover:bg-emerald-600"
            : "border-border bg-card text-card-foreground shadow-xs hover:bg-muted"
        )}
      >
        <Icon className="size-5 flex-none" />
        <span className="flex min-w-0 flex-1 flex-col text-left">
          <span className="truncate text-sm font-medium leading-tight">
            {item.label}
          </span>
          {item.description && (
            <span
              className={cn(
                "truncate text-xs leading-tight",
                item.primary ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {item.description}
            </span>
          )}
        </span>
        <ArrowIcon
          className={cn(
            "size-4 flex-none transition-transform duration-200",
            item.primary
              ? "group-hover:translate-x-0.5"
              : item.download
                ? "text-muted-foreground group-hover:translate-y-0.5"
                : "text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          )}
          aria-hidden
        />
      </Anchor>
    </motion.li>
  );
}

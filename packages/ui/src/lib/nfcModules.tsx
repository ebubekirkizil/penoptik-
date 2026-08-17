import React from "react";
import { 
  FileText, Building, ShoppingBag, 
  Tv, MessageSquare, Image as ImageIcon, Link as LinkIcon 
} from "lucide-react";

import { 
  WhatsAppIcon, PhoneIcon, MailIcon, TelegramIcon, MapPinIcon, IBANIcon,
  InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon, TikTokIcon, GitHubIcon 
} from "./BrandIcons";

export type ModuleDefinition = {
  id: string;
  label: string;
  category: "social" | "contact" | "business" | "media" | "other";
  icon: React.ReactNode;
  defaultTitle: string;
  placeholder: string;
  color: string;
};

export const AVAILABLE_MODULES: ModuleDefinition[] = [
  // İletişim (Contact)
  { id: "whatsapp", label: "WhatsApp", category: "contact", icon: <WhatsAppIcon size={20} />, defaultTitle: "WhatsApp", placeholder: "+90555...", color: "#25D366" },
  { id: "phone", label: "Telefon", category: "contact", icon: <PhoneIcon size={20} />, defaultTitle: "Ara", placeholder: "+90555...", color: "#3B82F6" },
  { id: "email", label: "E-Posta", category: "contact", icon: <MailIcon size={20} />, defaultTitle: "Bana Yaz", placeholder: "mail@site.com", color: "#EA4335" },
  { id: "telegram", label: "Telegram", category: "contact", icon: <TelegramIcon size={20} />, defaultTitle: "Telegram", placeholder: "t.me/kullanici", color: "#229ED9" },
  
  // Sosyal Medya (Social)
  { id: "instagram", label: "Instagram", category: "social", icon: <InstagramIcon size={20} />, defaultTitle: "Instagram", placeholder: "instagram.com/kullanici", color: "#E1306C" },
  { id: "linkedin", label: "LinkedIn", category: "social", icon: <LinkedInIcon size={20} />, defaultTitle: "LinkedIn", placeholder: "linkedin.com/in/...", color: "#0077B5" },
  { id: "twitter", label: "Twitter (X)", category: "social", icon: <XIcon size={20} />, defaultTitle: "X Profilim", placeholder: "x.com/...", color: "#000000" },
  { id: "youtube", label: "YouTube", category: "social", icon: <YouTubeIcon size={20} />, defaultTitle: "Kanalım", placeholder: "youtube.com/...", color: "#FF0000" },
  { id: "tiktok", label: "TikTok", category: "social", icon: <TikTokIcon size={20} />, defaultTitle: "TikTok", placeholder: "tiktok.com/@...", color: "#000000" },
  { id: "discord", label: "Discord", category: "social", icon: <MessageSquare size={20} />, defaultTitle: "Discord Sunucum", placeholder: "discord.gg/...", color: "#5865F2" },
  { id: "github", label: "GitHub", category: "social", icon: <GitHubIcon size={20} />, defaultTitle: "GitHub", placeholder: "github.com/...", color: "#333333" },

  // İş & Finans (Business)
  { id: "iban", label: "Banka / IBAN", category: "business", icon: <IBANIcon size={20} />, defaultTitle: "IBAN Bilgilerim", placeholder: "TR...", color: "#10B981" },
  { id: "company", label: "Şirket Websitesi", category: "business", icon: <Building size={20} />, defaultTitle: "Şirketim", placeholder: "sirket.com", color: "#4F46E5" },
  { id: "portfolio", label: "Portfolyo", category: "business", icon: <FileText size={20} />, defaultTitle: "Çalışmalarım", placeholder: "behance.net/...", color: "#2563EB" },
  { id: "ecommerce", label: "Ürün Linki", category: "business", icon: <ShoppingBag size={20} />, defaultTitle: "Mağazam", placeholder: "Trendyol vb. ürün linki", color: "#f97316" },
  
  // Medya & Diğer (Media & Other)
  { id: "gallery", label: "Fotoğraf Ekle", category: "media", icon: <ImageIcon size={20} />, defaultTitle: "Görsel", placeholder: "Resim Linki (URL)", color: "#8B5CF6" },
  { id: "spotify", label: "Spotify", category: "media", icon: <Tv size={20} />, defaultTitle: "Listem", placeholder: "spotify.com/...", color: "#1DB954" },
  { id: "location", label: "Konum / Harita", category: "other", icon: <MapPinIcon size={20} />, defaultTitle: "Beni Bul", placeholder: "maps.google.com/...", color: "#EF4444" },
  { id: "custom", label: "Özel Link", category: "other", icon: <LinkIcon size={20} />, defaultTitle: "Web Sitem", placeholder: "site.com", color: "#6B7280" },
];

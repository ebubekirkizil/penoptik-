"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Save, Plus, Trash2, Check, ExternalLink, 
  User, Palette, Link as LinkIcon, CheckCircle2, Image as ImageIcon,
  Sparkles, Layers, RefreshCw, Sliders, Shield, KeyRound
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AVAILABLE_MODULES } from "@/lib/nfcModules";
import { 
  WhatsAppIcon, PhoneIcon, MailIcon, TelegramIcon, MapPinIcon, IBANIcon,
  InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon, TikTokIcon, GitHubIcon 
} from "@/lib/BrandIcons";

export default function CardDesignerClient({ initialCard, serialCode }: { initialCard: any, serialCode: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!initialCard.user?.nfcProfile);
  const [profile, setProfile] = useState<any>(initialCard.user?.nfcProfile || null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'info' | 'appearance' | 'modules' | 'security'>('info');

  // Drag to scroll tabs
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabContainerRef.current.offsetLeft);
    setScrollLeft(tabContainerRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    tabContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Parse existing JSON themeColor config
  let initDesignConfig: any = {};
  try {
    if (profile?.themeColor && profile.themeColor.startsWith('{')) {
      initDesignConfig = JSON.parse(profile.themeColor);
    } else {
      const [c, t] = (profile?.themeColor || "#2563EB").split(';template=');
      initDesignConfig = { primaryColor: c, templateStyle: t || 'glassmorphism' };
    }
  } catch (e) {
    initDesignConfig = { primaryColor: "#2563EB", templateStyle: 'glassmorphism' };
  }

  // Form states
  const [name, setName] = useState(profile?.name || `Kart ${serialCode}`);
  const [slug, setSlug] = useState(profile?.slug || serialCode);
  const [title, setTitle] = useState(profile?.title || "Özel Kart Profili");
  const [bio, setBio] = useState(profile?.bio || "");
  const [companyName, setCompanyName] = useState(profile?.companyName || "");
  const [profileImage, setProfileImage] = useState(profile?.profileImage || "");
  const [coverImage, setCoverImage] = useState(profile?.coverImage || "");
  const [isPinActive, setIsPinActive] = useState(profile?.isPinActive || false);
  const [pinCode, setPinCode] = useState(profile?.pinCode || "");
  
  // Theme & Granular Colors
  const [templateStyle, setTemplateStyle] = useState(initDesignConfig.templateStyle || "glassmorphism");
  const [primaryColor, setPrimaryColor] = useState(initDesignConfig.primaryColor || "#2563EB");

  // Granular color overrides
  const [customBgGrad1, setCustomBgGrad1] = useState(initDesignConfig.customBgGrad1 || "");
  const [customBgGrad2, setCustomBgGrad2] = useState(initDesignConfig.customBgGrad2 || "");
  const [customNameColor, setCustomNameColor] = useState(initDesignConfig.customNameColor || "");
  const [customTitleColor, setCustomTitleColor] = useState(initDesignConfig.customTitleColor || "");
  const [customBtnBg, setCustomBtnBg] = useState(initDesignConfig.customBtnBg || "");
  const [customBtnText, setCustomBtnText] = useState(initDesignConfig.customBtnText || "");
  const [customCardBg, setCustomCardBg] = useState(initDesignConfig.customCardBg || "");
  const [customCardText, setCustomCardText] = useState(initDesignConfig.customCardText || "");

  // PIN Ekranı Özellextirmeleri
  const [pinBgColor, setPinBgColor] = useState(initDesignConfig.pinBgColor || "");
  const [pinTextColor, setPinTextColor] = useState(initDesignConfig.pinTextColor || "");
  const [pinImage, setPinImage] = useState(initDesignConfig.pinImage || "");

  
  // Modül Kutucukları İçin Özel Renkler
  const [customModuleBg, setCustomModuleBg] = useState(initDesignConfig.customModuleBg || "");
  const [customModuleText, setCustomModuleText] = useState(initDesignConfig.customModuleText || "");
  const [customModuleBorder, setCustomModuleBorder] = useState(initDesignConfig.customModuleBorder || "");
  const [modulesHeadingText, setModulesHeadingText] = useState(initDesignConfig.modulesHeadingText || "Bağlantılar & Sosyal Ağlar");
  const [modulesHeadingColor, setModulesHeadingColor] = useState(initDesignConfig.modulesHeadingColor || "");
  
  // Profil Resmi Boyutu ve Çerçeve Rengi
  const [profileImageBorderColor, setProfileImageBorderColor] = useState(initDesignConfig.profileImageBorderColor || "");
  
  // Profil Resmi Boyutu (Yüzdelik)
  const [profileImageSize, setProfileImageSize] = useState<number>(initDesignConfig.profileImageSize || 100);
  // Profil Resmi Konumu
  const [profileImageFit, setProfileImageFit] = useState<string>(initDesignConfig.profileImageFit || 'cover');
  const [profileImagePosition, setProfileImagePosition] = useState<string>(initDesignConfig.profileImagePosition || 'center center');
  // Profil Resmi Şekli
  const [profileImageShape, setProfileImageShape] = useState<string>(initDesignConfig.profileImageShape || 'circle');

  // Kapak Resmi Kontrolü
  const [coverImageFit, setCoverImageFit] = useState<string>(initDesignConfig.coverImageFit || 'cover');
  const [coverImagePosition, setCoverImagePosition] = useState<string>(initDesignConfig.coverImagePosition || 'center center');
  const [coverImageZoom, setCoverImageZoom] = useState<number>(initDesignConfig.coverImageZoom || 100);
  const [coverImageOpacity, setCoverImageOpacity] = useState<number>(initDesignConfig.coverImageOpacity || 90);


  const [modules, setModules] = useState<any[]>(profile?.modules || [
    { type: 'whatsapp', title: 'WhatsApp İletixim', url: '+905551234567' },
    { type: 'phone', title: 'Telefon Et', url: '+905551234567' },
    { type: 'instagram', title: 'Instagram Hesabım', url: 'https://instagram.com' }
  ]);

  const colorPresets = ["#2563EB", "#16A34A", "#DC2626", "#9333EA", "#000000", "#CA8A04", "#0D9488", "#E11D48"];

  const coverPresets = [
    // Genel
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80",
    "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&q=80",
    // Mimarlık / İnxaat
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", // kurumsal ofis
    // Sağlık
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
    // Teknoloji / Yazılım
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    // Hukuk / Kurumsal
    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    // Emlak / Gayrimenkul
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    // Otomotiv
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
    // Eğitim / Koçluk
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"
  ];

  const templateOptions = [
    { id: "PORTFOLIO", name: "Dinamik Portfolyo (Hareketli Grid)", desc: "Özel arkaplan animasyonlu vCard", g1: "#000000", g2: "#000000" },
    { id: "glassmorphism", name: "Buzlu Cam (Glassmorphism)", desc: "Koyu xeffaf cam kartlar", g1: "#0f172a", g2: "#1e1b4b" },
    { id: "aurora", name: "Gece Nuru (Aurora Fluid)", desc: "Geçixli hareketli mor-gece", g1: "#311042", g2: "#0f172a" },
    { id: "neon", name: "Siber Neon (Cyberpunk)", desc: "Siyah arka plan, neon ixık", g1: "#000000", g2: "#090d16" },
    { id: "gold", name: "Lüks Altın (VIP Gold)", desc: "Altın sarısı detaylar, VIP", g1: "#0a0a0a", g2: "#171717" },
    { id: "emerald", name: "Zümrüt Yexil (Emerald)", desc: "Kurumsal zümrüt degrade", g1: "#022c22", g2: "#064e3b" },
    { id: "cosmic", name: "Holografik (Cosmic Purple)", desc: "Derin uzay ve kozmik mor", g1: "#1e1b4b", g2: "#312e81" },
    { id: "midnight", name: "Gece Yarısı (Pitch Black)", desc: "Tam siyah karanlık tasarım", g1: "#030712", g2: "#111827" },
    { id: "minimal", name: "Saf Şık Beyaz (Clean Light)", desc: "Sade, kurumsal beyaz slate", g1: "#f8fafc", g2: "#f1f5f9" },
    
    // YENİ EKLENEN ŞABLONLAR (20'ye tamamlama)
    { id: "sunset", name: "Günbatımı (Sunset Glow)", desc: "Sıcak turuncu ve pembe geçixler", g1: "#9a3412", g2: "#831843" },
    { id: "ocean", name: "Okyanus (Deep Ocean)", desc: "Derin mavi ve turkuaz tonları", g1: "#082f49", g2: "#064e3b" },
    { id: "ruby", name: "Yakut (Ruby Red)", desc: "Koyu kırmızı ve bordo zenginliği", g1: "#4c0519", g2: "#2a0410" },
    { id: "forest", name: "Orman (Mystic Forest)", desc: "Hafif puslu doğa yexili", g1: "#14532d", g2: "#064e3b" },
    { id: "cyberblue", name: "Siber Mavi (Cyber Blue)", desc: "Gelecekten gelen neon mavi", g1: "#0c173f", g2: "#0a0628" },
    { id: "pastel", name: "Pastel Rüya (Pastel Dream)", desc: "Yumuxak açık pastel tonlar", g1: "#fdf4ff", g2: "#fae8ff" },
    { id: "monochrome", name: "Monokrom (Greyscale)", desc: "Klasik siyah-beyaz zıtlığı", g1: "#27272a", g2: "#09090b" },
    { id: "luxury_silver", name: "Gümüx Lüks (Silver Metal)", desc: "Kurumsal gri ve gümüx yansıma", g1: "#52525b", g2: "#27272a" },
    { id: "lavender", name: "Lavanta (Lavender Mist)", desc: "Zarif, hafif mor tonları", g1: "#faf5ff", g2: "#f3e8ff" },
    { id: "amber", name: "Kehribar (Amber Light)", desc: "Sıcak, güven veren sarı-kahve", g1: "#451a03", g2: "#78350f" },
    { id: "animated_wave", name: "Hareketli Dalga (Anim Wave)", desc: "CSS dalga efekti (Koyu)", g1: "#1e1b4b", g2: "#0f172a" },
    { id: "animated_mesh", name: "Hareketli Ağ (Anim Mesh)", desc: "Sürekli renk değixtiren degrade", g1: "#4c1d95", g2: "#be185d" },
    { id: "animated_aurora", name: "Hareketli Aurora (Anim Aurora)", desc: "Kuzey ıxıkları efekti", g1: "#0f766e", g2: "#4338ca" },
    { id: "animated_plasma", name: "Hareketli Plazma (Anim Plasma)", desc: "Canlı ve sıcak renk geçixleri", g1: "#e11d48", g2: "#ea580c" },
    { id: "animated_ocean", name: "Hareketli Okyanus (Anim Ocean)", desc: "Derin su altı akıntısı", g1: "#0369a1", g2: "#0284c7" },
    { id: "animated_fire", name: "Hareketli Atex (Anim Fire)", desc: "Lav ve atex dalgalanması", g1: "#991b1b", g2: "#f97316" },
    { id: "animated_galaxy", name: "Hareketli Galaksi (Anim Galaxy)", desc: "Derin uzay nebulası", g1: "#3b0764", g2: "#172554" }
  ];

  // Auto initialize profile if needed
  useEffect(() => {
    if (initializing) {
      const initProfile = async () => {
        try {
          const res = await fetch('/api/nfc/admin/cards/init-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serialCode })
          });
          const data = await res.json();
          if (data.success) {
            router.refresh();
            setTimeout(() => {
              window.location.reload();
            }, 800);
          } else {
            alert("Profil baxlatılamadı: " + data.error);
          }
        } catch (e) {
          console.error(e);
        }
      };
      initProfile();
    }
  }, [initializing, serialCode, router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveAll = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const jsonConfig = JSON.stringify({
        templateStyle,
        primaryColor,
        customBgGrad1,
        customBgGrad2,
        customNameColor,
        customTitleColor,
        customBtnBg,
        customBtnText,
        customCardBg,
        customCardText,
        customModuleBg,
        customModuleText,
        customModuleBorder,
        modulesHeadingText,
        modulesHeadingColor,
        profileImageSize,
        profileImageFit,
        profileImagePosition,
        profileImageShape,
        profileImageBorderColor,
        coverImageFit,
        coverImagePosition,
        coverImageZoom,
        coverImageOpacity,
        pinBgColor,
        pinTextColor,
        pinImage
      });

      // 1. Profil Bilgilerini Güncelle
      const profileRes = await fetch("/api/nfc/admin/cards/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          name, 
          title, 
          bio, 
          companyName, 
          themeColor: jsonConfig,
          profileImage,
          coverImage,
          isPinActive,
          pinCode,
          layout: templateStyle === "PORTFOLIO" ? "PORTFOLIO" : "DEFAULT",
          slug
        })
      });

      const profileData = await profileRes.json();
      if (profileData.success && profileData.profile) {
        setProfile(profileData.profile);
      }

      // 2. Modülleri Güncelle
      const moduleRes = await fetch("/api/nfc/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          modules
        })
      });

      if (profileRes.ok && moduleRes.ok) {
        showToast("Tüm renk ve xablon özellextirmeleri kaydedildi!");
        router.refresh();
      } else {
        alert("Kaydetme sırasında bir hata oluxtu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Canvas tabanlı küçültme ve base64 çıkarma
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const max_size = type === 'cover' ? 1200 : 600;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.65); // 0.65 kalite ile küçült (yer kaplamasın)

        if (type === 'profile') setProfileImage(dataUrl);
        else setCoverImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addModuleFromPreset = (preset: any) => {
    setModules([
      ...modules,
      {
        type: preset.id,
        title: preset.defaultTitle,
        url: preset.placeholder || "",
        icon: preset.id
      }
    ]);
  };

  const updateModule = (index: number, key: string, value: string) => {
    const newMods = [...modules];
    newMods[index] = { ...newMods[index], [key]: value };
    setModules(newMods);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const renderBrandIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <WhatsAppIcon size={18} />;
      case 'phone': return <PhoneIcon size={18} />;
      case 'email': return <MailIcon size={18} />;
      case 'telegram': return <TelegramIcon size={18} />;
      case 'instagram': return <InstagramIcon size={18} />;
      case 'linkedin': return <LinkedInIcon size={18} />;
      case 'twitter': return <XIcon size={18} />;
      case 'youtube': return <YouTubeIcon size={18} />;
      case 'tiktok': return <TikTokIcon size={18} />;
      case 'github': return <GitHubIcon size={18} />;
      case 'location': return <MapPinIcon size={18} />;
      case 'iban': return <IBANIcon size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium animate-pulse">NFC Kart profili hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  const livePublicUrl = slug ? `/p/${slug}` : `/nfc/${serialCode}`;

  // Preview computed styles
  const activeTmplObj = templateOptions.find(t => t.id === templateStyle) || templateOptions[0];
  const previewBg1 = customBgGrad1 || activeTmplObj.g1;
  const previewBg2 = customBgGrad2 || activeTmplObj.g2;
  const previewNameColor = customNameColor || (templateStyle === 'minimal' ? '#0f172a' : '#ffffff');
  const previewTitleColor = customTitleColor || (templateStyle === 'minimal' ? '#475569' : 'rgba(255, 255, 255, 0.8)');
  const previewBtnBg = customBtnBg || primaryColor;
  const previewBtnText = customBtnText || '#ffffff';

  const isAnimTmpl = templateStyle.startsWith('animated_');
  const getAnimClass = () => {
    if(templateStyle === 'animated_wave') return 'anim-wave-bg';
    if(templateStyle === 'animated_mesh') return 'anim-mesh-bg';
    if(templateStyle === 'animated_aurora') return 'anim-aurora-bg';
    if(templateStyle === 'animated_plasma') return 'anim-plasma-bg';
    if(templateStyle === 'animated_ocean') return 'anim-ocean-bg';
    if(templateStyle === 'animated_fire') return 'anim-fire-bg';
    if(templateStyle === 'animated_galaxy') return 'anim-galaxy-bg';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <a 
            href={livePublicUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="ml-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
          >
            Canlı Kartı Aç <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/nfc/cards" className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Kart Tasarımı: {serialCode}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Aktif
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Süper Admin İnce Renk & Şablon Tasarım Stüdyosu</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={livePublicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 md:flex-none justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <ExternalLink size={16} /> Canlı Önizleme
          </a>
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="flex-1 md:flex-none justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Save size={16} /> {loading ? "Kaydediliyor..." : "Tümünü Kaydet"}
          </button>
        </div>
      </div>

      {/* Grid: Sol Form Editörü (7 col), Sağ Canlı Önizleme (5 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SOL FORM EDİTÖRÜ */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Tab Baxlıkları */}
          <div 
            ref={tabContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex flex-row border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2 gap-2 overflow-x-auto cursor-grab active:cursor-grabbing hide-scrollbar"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'info'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User size={16} className="hidden sm:block" /> Bilgiler & Görseller
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Palette size={16} className="hidden sm:block" /> Şablon & Özel Renkler
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'modules'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LinkIcon size={16} className="hidden sm:block" /> Bağlantılar & Logolar
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Shield size={16} className="hidden sm:block" /> Güvenlik & PIN
            </button>
          </div>

          {/* Tab İçerikleri */}
          <div className="p-6 md:p-8 space-y-6">
            
            {/* TEMEL BİLGİLER TABI */}
            {activeTab === 'info' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      İsim Soyisim
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Ebubekir Kızıldax"
                      className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-slate-950 dark:text-white dark:border-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Özel URL (Alan Adı)
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-xl text-slate-500 text-sm font-medium">
                        /p/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        placeholder="kullanici-adi"
                        className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-r-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-slate-950 dark:text-white dark:border-slate-700 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Unvan / Meslek
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Marketing Manager"
                      className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-slate-950 dark:text-white dark:border-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Şirket Adı
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Örn: SENTIENTWIRE.COM"
                      className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-slate-950 dark:text-white dark:border-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Biyografi / Açıklama
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Kısa özgeçmix veya xirket açıklaması..."
                    className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-slate-950 dark:text-white dark:border-slate-700 font-medium"
                  />
                </div>

                {/* Profil & Kapak Fotoğrafı URLs */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Profil ve Kapak Fotoğrafları
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Profil Fotoğrafı Yükle
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <ImageIcon size={16} /> Seç ve Yükle
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} />
                      </label>
                      {profileImage && <button onClick={() => setProfileImage("")} className="text-xs text-rose-500 font-semibold underline">Kaldır</button>}
                    </div>

                    {/* Profil Resmi Düzenleme Araçları */}
                    <div className="mt-4 space-y-3">
                      {/* Boyut */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">📐 Boyut</label>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">%{profileImageSize}</span>
                        </div>
                        <input type="range" min="50" max="200" step="5" value={profileImageSize} onChange={(e) => setProfileImageSize(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                          <span>Küçük</span><span>Normal</span><span>Büyük</span>
                        </div>
                      </div>

                      {/* Şekil */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">🔷 Çerçeve Şekli</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['circle', 'rounded', 'square'].map((shape) => (
                            <button key={shape} onClick={() => setProfileImageShape(shape)}
                              className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                profileImageShape === shape
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                              }`}>
                              {shape === 'circle' ? '⬤ Yuvarlak' : shape === 'rounded' ? '▣ Köxeli' : '◼ Kare'}
                            </button>
                          ))}
                        </div>
                        <div className="mt-4">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Çerçeve Rengi (Özel)</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={profileImageBorderColor || "#ffffff"} onChange={e => setProfileImageBorderColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                            <input type="text" value={profileImageBorderColor} onChange={e => setProfileImageBorderColor(e.target.value)} placeholder="Varsayılan (Yarı Şeffaf Beyaz)" className="w-full px-2 py-1.5 bg-white text-slate-900 border border-slate-300 rounded text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                            {profileImageBorderColor && <button onClick={() => setProfileImageBorderColor('')} className="text-rose-500 text-xs font-bold px-1">X</button>}
                          </div>
                        </div>
                      </div>

                      {/* Nesne Konumu */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">🎯 Resim Merkezi</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { label: '↖', val: 'top left' }, { label: '⬆', val: 'top center' }, { label: '↗', val: 'top right' },
                            { label: '◀', val: 'center left' }, { label: '✦', val: 'center center' }, { label: '▶', val: 'center right' },
                            { label: '↙', val: 'bottom left' }, { label: '⬇', val: 'bottom center' }, { label: '↘', val: 'bottom right' },
                          ].map(({ label, val }) => (
                            <button key={val} onClick={() => setProfileImagePosition(val)}
                              className={`h-9 rounded-lg text-sm font-bold border transition-all ${
                                profileImagePosition === val
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                              }`}>{label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 mt-2">
                      Kapak (Banner) Fotoğrafı Yükle
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <ImageIcon size={16} /> Seç ve Yükle
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
                      </label>
                      {coverImage && <button onClick={() => setCoverImage("")} className="text-xs text-rose-500 font-semibold underline">Kaldır</button>}
                    </div>

                    {/* Kapak Resmi Düzenleme Araçları */}
                    {coverImage && (
                      <div className="mt-3 space-y-3">
                        {/* Konum 3x3 Grid */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">🎯 Kapak Merkezi</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { label: '↖', val: 'top left' }, { label: '⬆', val: 'top center' }, { label: '↗', val: 'top right' },
                              { label: '◀', val: 'center left' }, { label: '✦', val: 'center center' }, { label: '▶', val: 'center right' },
                              { label: '↙', val: 'bottom left' }, { label: '⬇', val: 'bottom center' }, { label: '↘', val: 'bottom right' },
                            ].map(({ label, val }) => (
                              <button key={val} onClick={() => setCoverImagePosition(val)}
                                className={`h-9 rounded-lg text-sm font-bold border transition-all ${
                                  coverImagePosition === val
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                                }`}>{label}</button>
                            ))}
                          </div>
                        </div>

                        {/* Zoom */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">🔍 Yakınlaxtırma</label>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">%{coverImageZoom}</span>
                          </div>
                          <input type="range" min="100" max="200" step="5" value={coverImageZoom} onChange={(e) => setCoverImageZoom(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                            <span>Normal</span><span>Yakın</span><span>Çok Yakın</span>
                          </div>
                        </div>

                        {/* Opaklık */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">🌫 Opaklık</label>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">%{coverImageOpacity}</span>
                          </div>
                          <input type="range" min="20" max="100" step="5" value={coverImageOpacity} onChange={(e) => setCoverImageOpacity(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                            <span>Soluk</span><span>Orta</span><span>Tam</span>
                          </div>
                        </div>

                        {/* Kırpma Modu */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">✂️ Görüntüleme Modu</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[{ val: 'cover', label: 'Dolgu (Cover)' }, { val: 'contain', label: 'Tam Görüntü' }].map(({ val, label }) => (
                              <button key={val} onClick={() => setCoverImageFit(val)}
                                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                                  coverImageFit === val
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                                }`}>{label}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hazır Kapak Banner Seçenekleri */}
                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hazır Sektörel Kapak Görselleri ({coverPresets.length} Adet)</p>
                      <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                        {coverPresets.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setCoverImage(img)}
                            className="h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
                          >
                            <img src={img} alt="cover preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GÖRÜNÜM VE İNCE RENK ÖZELLEŞTİRMELERİ TABI */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                
                {/* 20 Tasarım Şablon Kataloğu */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                    Kart Tasarım Şablon Kataloğu (25 Tasarım)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templateOptions.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => setTemplateStyle(tmpl.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          templateStyle === tmpl.id
                            ? "bg-blue-50/90 border-blue-500 dark:bg-blue-950/50 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20"
                            : "bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{tmpl.name}</p>
                          {templateStyle === tmpl.id && <Check className="text-blue-600 dark:text-blue-400" size={16} />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{tmpl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* İnce Detaylı Renk Ayarları */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Detaylı İnce Renk Özellextirme
                    </h3>
                  </div>

                  {/* Arka Plan Çift Renk Gradient */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Arka Plan Çift Renk Degrade (Gradient Blend)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">1. Renk (Baxlangıç)</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={customBgGrad1 || activeTmplObj.g1} onChange={e => setCustomBgGrad1(e.target.value)} className="w-10 h-8 rounded cursor-pointer border flex-shrink-0" />
                          <input type="text" value={customBgGrad1 || activeTmplObj.g1} onChange={e => setCustomBgGrad1(e.target.value)} className="w-full px-2 py-1 bg-white text-slate-900 border rounded text-xs font-mono dark:bg-slate-900 dark:text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">2. Renk (Bitix)</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={customBgGrad2 || activeTmplObj.g2} onChange={e => setCustomBgGrad2(e.target.value)} className="w-10 h-8 rounded cursor-pointer border flex-shrink-0" />
                          <input type="text" value={customBgGrad2 || activeTmplObj.g2} onChange={e => setCustomBgGrad2(e.target.value)} className="w-full px-2 py-1 bg-white text-slate-900 border rounded text-xs font-mono dark:bg-slate-900 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metin & Buton Renk Özellextirmeleri */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* İsim Yazı Rengi */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">İsim Yazı Rengi</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customNameColor || "#ffffff"} onChange={e => setCustomNameColor(e.target.value)} className="w-9 h-9 flex-shrink-0 rounded cursor-pointer border border-slate-200 dark:border-slate-700" />
                        <input type="text" value={customNameColor} onChange={e => setCustomNameColor(e.target.value)} placeholder="Varsayılan" className="flex-1 min-w-0 px-2.5 py-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                      </div>
                    </div>

                    {/* Unvan Yazı Rengi */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Unvan Yazı Rengi</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customTitleColor || "#cbd5e1"} onChange={e => setCustomTitleColor(e.target.value)} className="w-9 h-9 flex-shrink-0 rounded cursor-pointer border border-slate-200 dark:border-slate-700" />
                        <input type="text" value={customTitleColor} onChange={e => setCustomTitleColor(e.target.value)} placeholder="Varsayılan" className="flex-1 min-w-0 px-2.5 py-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                      </div>
                    </div>

                    {/* Rehbere Kaydet Arka Plan Rengi */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Rehbere Kaydet Buton Rengi</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customBtnBg || primaryColor} onChange={e => setCustomBtnBg(e.target.value)} className="w-9 h-9 flex-shrink-0 rounded cursor-pointer border border-slate-200 dark:border-slate-700" />
                        <input type="text" value={customBtnBg} onChange={e => setCustomBtnBg(e.target.value)} placeholder="Ana Vurgu" className="flex-1 min-w-0 px-2.5 py-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                      </div>
                    </div>

                    {/* Rehbere Kaydet Yazı Rengi */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Rehbere Kaydet Yazı Rengi</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={customBtnText || "#ffffff"} onChange={e => setCustomBtnText(e.target.value)} className="w-9 h-9 flex-shrink-0 rounded cursor-pointer border border-slate-200 dark:border-slate-700" />
                        <input type="text" value={customBtnText} onChange={e => setCustomBtnText(e.target.value)} placeholder="#ffffff" className="flex-1 min-w-0 px-2.5 py-1.5 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Bağlantı (Modül) Kutucuk Renkleri</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Modül Arka Plan */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 truncate">Kutu Arka Plan</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                          <input type="color" value={customModuleBg || "#0f172a"} onChange={e => setCustomModuleBg(e.target.value)} className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer" />
                        </div>
                        <input type="text" value={customModuleBg} onChange={e => setCustomModuleBg(e.target.value)} placeholder="Saydam/Renk" className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    {/* Modül Metin */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 truncate">Kutu Yazı Rengi</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                          <input type="color" value={customModuleText || "#ffffff"} onChange={e => setCustomModuleText(e.target.value)} className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer" />
                        </div>
                        <input type="text" value={customModuleText} onChange={e => setCustomModuleText(e.target.value)} placeholder="#ffffff" className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    {/* Modül Çerçeve */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 truncate">Kutu Çerçeve</label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                          <input type="color" value={customModuleBorder || "#ffffff"} onChange={e => setCustomModuleBorder(e.target.value)} className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer" />
                        </div>
                        <input type="text" value={customModuleBorder} onChange={e => setCustomModuleBorder(e.target.value)} placeholder="Şeffaf/Renk" className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* BAĞLANTILAR VE MODÜLLER TABI */}
            {activeTab === 'modules' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                    Hızlı Gerçek Logolu Modül Ekle
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_MODULES.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => addModuleFromPreset(preset)}
                        className="px-3 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        <span className="p-1 rounded-md text-white" style={{ backgroundColor: preset.color }}>
                          {preset.icon}
                        </span>
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    "Bağlantılar" Baxlığını Düzenle
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Baxlık Metni</label>
                      <input type="text" value={modulesHeadingText} onChange={e => setModulesHeadingText(e.target.value)} placeholder="Bağlantılar & Sosyal Ağlar" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium dark:bg-slate-900 dark:text-white dark:border-slate-700 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Baxlık Rengi</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={modulesHeadingColor || "#ffffff"} onChange={e => setModulesHeadingColor(e.target.value)} className="w-9 h-9 flex-shrink-0 rounded cursor-pointer border border-slate-200 dark:border-slate-700" />
                        <input type="text" value={modulesHeadingColor} onChange={e => {
                          let val = e.target.value;
                          if (val.length > 0 && !val.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(val)) val = '#' + val;
                          setModulesHeadingColor(val);
                        }} placeholder="Örn: #ffffff" className="flex-1 min-w-0 px-2.5 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                        {modulesHeadingColor && <button onClick={() => setModulesHeadingColor('')} className="text-rose-500 text-xs font-bold px-2">X</button>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Ekli Olan Bağlantılar ({modules.length})
                  </h3>

                  {modules.map((mod, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3 items-start shadow-sm"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Modül Tipi
                            </label>
                            <select
                              value={mod.type}
                              onChange={(e) => updateModule(idx, 'type', e.target.value)}
                              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm font-medium dark:bg-slate-900 dark:text-white dark:border-slate-700 outline-none"
                            >
                              {AVAILABLE_MODULES.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Baxlık
                            </label>
                            <input
                              type="text"
                              value={mod.title}
                              onChange={(e) => updateModule(idx, 'title', e.target.value)}
                              placeholder="Örn: WhatsApp İletixim"
                              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm font-medium dark:bg-slate-900 dark:text-white dark:border-slate-700 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Bağlantı (URL / No)
                          </label>
                          <input
                            type="text"
                            value={mod.url}
                            onChange={(e) => updateModule(idx, 'url', e.target.value)}
                            placeholder="https://... veya Telefon / WhatsApp No"
                            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm font-medium dark:bg-slate-900 dark:text-white dark:border-slate-700 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kutu Arka Plan (Özel)</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={mod.bgColor || "#000000"} onChange={(e) => updateModule(idx, 'bgColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                              <input type="text" value={mod.bgColor || ""} onChange={(e) => {
                                let val = e.target.value;
                                if (val.length > 0 && !val.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(val)) val = '#' + val;
                                updateModule(idx, 'bgColor', val);
                              }} placeholder="Örn: #ffffff" className="w-full px-2 py-1.5 bg-white text-slate-900 border border-slate-300 rounded text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                              {mod.bgColor && <button onClick={() => updateModule(idx, 'bgColor', '')} className="text-rose-500 text-xs font-bold px-1">X</button>}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Yazı Rengi (Özel)</label>
                            <div className="flex items-center gap-2">
                              <input type="color" value={mod.textColor || "#ffffff"} onChange={(e) => updateModule(idx, 'textColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                              <input type="text" value={mod.textColor || ""} onChange={(e) => {
                                let val = e.target.value;
                                if (val.length > 0 && !val.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(val)) val = '#' + val;
                                updateModule(idx, 'textColor', val);
                              }} placeholder="Örn: #ffffff" className="w-full px-2 py-1.5 bg-white text-slate-900 border border-slate-300 rounded text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                              {mod.textColor && <button onClick={() => updateModule(idx, 'textColor', '')} className="text-rose-500 text-xs font-bold px-1">X</button>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeModule(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors mt-6"
                        title="Modülü Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  {modules.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <p className="text-slate-400 text-sm font-medium">Henüz hiç bağlantı eklenmedi. Yukarıdaki butonlardan ekleyebilirsiniz.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GÜVENLİK VE PIN TABI */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    NFC Kart Güvenlik (PIN Koruması)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Kullanıcılar NFC profiline link üzerinden erixtiğinde veya kendi baxına ayarlara girmek istediğinde 
                    belirlediğiniz bu PIN kodunu girmek zorunda kalır. Sadece NFC okutma ixlemi doğrudan bypass (girix) sağlar.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">PIN Korumasını Aktiflextir</h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1">
                      Açık olduğunda xifre sorulur, kapalı olduğunda profil herkese açık görünür.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={isPinActive}
                      onChange={(e) => setIsPinActive(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {isPinActive && (
                  <>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Müxteri PIN Kodu (Min 4, Max 6 Rakam)
                      </label>
                      <div className="relative max-w-xs">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="password"
                          maxLength={6}
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Örn: 1453"
                          className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-slate-900 dark:text-white dark:border-slate-700 font-mono tracking-widest font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                        PIN Ekranı Tasarımı
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Arka Plan Rengi</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={pinBgColor || primaryColor} onChange={e => setPinBgColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-slate-200 dark:border-slate-700" />
                            <input type="text" value={pinBgColor} onChange={e => {
                              let val = e.target.value;
                              if (val.length > 0 && !val.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(val)) val = '#' + val;
                              setPinBgColor(val);
                            }} placeholder="Varsayılan: Temaya Uygun" className="flex-1 w-full px-2.5 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                            {pinBgColor && <button onClick={() => setPinBgColor('')} className="text-rose-500 text-xs font-bold px-1">X</button>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Yazı Rengi</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={pinTextColor || "#ffffff"} onChange={e => setPinTextColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-slate-200 dark:border-slate-700" />
                            <input type="text" value={pinTextColor} onChange={e => {
                              let val = e.target.value;
                              if (val.length > 0 && !val.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(val)) val = '#' + val;
                              setPinTextColor(val);
                            }} placeholder="Varsayılan: Beyaz" className="flex-1 w-full px-2.5 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs font-mono dark:bg-slate-900 dark:text-white dark:border-slate-700" />
                            {pinTextColor && <button onClick={() => setPinTextColor('')} className="text-rose-500 text-xs font-bold px-1">X</button>}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Arka Plan Görseli (URL)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={pinImage} 
                            onChange={e => setPinImage(e.target.value)} 
                            placeholder="https://... (Görsel URL'si)" 
                            className="flex-1 px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm dark:bg-slate-900 dark:text-white dark:border-slate-700 outline-none" 
                          />
                          {pinImage && <button onClick={() => setPinImage('')} className="px-3 py-2 bg-rose-50 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors">Sil</button>}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Eğer görsel eklerseniz, arka plan rengi yerine bu görsel blurlanarak gösterilir.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Alt Kaydet Butonu */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleSaveAll}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Save size={16} /> {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>

          </div>
        </div>

        {/* SAĞ CANLI MOBİL ÖNİZLEME (Sticky Phone Frame) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-3 border-[6px] border-slate-800 shadow-2xl relative max-w-[330px] mx-auto min-h-[600px] flex flex-col text-slate-900">
            {/* Telefon Çentiği */}
            <div className="w-28 h-5 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20"></div>

            <style>{`
              @keyframes bgWaveAdmin {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .anim-wave-bg {
                background: linear-gradient(-45deg, ${previewBg1}, ${previewBg2}, #312e81, #1e1b4b) !important;
                background-size: 400% 400% !important;
                animation: bgWaveAdmin 4s ease infinite !important;
              }
              .anim-mesh-bg {
                background: linear-gradient(120deg, ${previewBg1}, ${previewBg2}, #fb7185, #8b5cf6) !important;
                background-size: 300% 300% !important;
                animation: bgWaveAdmin 4s ease infinite !important;
              }
              .anim-aurora-bg {
                background: linear-gradient(45deg, ${previewBg1}, ${previewBg2}, #2dd4bf, #34d399) !important;
                background-size: 400% 400% !important;
                animation: bgWaveAdmin 5s ease infinite !important;
              }
              .anim-plasma-bg {
                background: linear-gradient(135deg, ${previewBg1}, ${previewBg2}, #f43f5e, #fb923c) !important;
                background-size: 400% 400% !important;
                animation: bgWaveAdmin 3s ease infinite !important;
              }
              .anim-ocean-bg {
                background: linear-gradient(-135deg, ${previewBg1}, ${previewBg2}, #38bdf8, #818cf8) !important;
                background-size: 400% 400% !important;
                animation: bgWaveAdmin 6s ease infinite !important;
              }
              .anim-fire-bg {
                background: linear-gradient(90deg, ${previewBg1}, ${previewBg2}, #ef4444, #fcd34d) !important;
                background-size: 300% 300% !important;
                animation: bgWaveAdmin 4s ease infinite !important;
              }
              .anim-galaxy-bg {
                background: linear-gradient(180deg, ${previewBg1}, ${previewBg2}, #c084fc, #38bdf8) !important;
                background-size: 400% 400% !important;
                animation: bgWaveAdmin 5s ease infinite !important;
              }
            `}</style>
            
            {/* Canlı Ekran - Çift Renk Gradient & Özellextirilebilir Renkler */}
            <div 
              className={`flex-1 rounded-[2rem] overflow-hidden flex flex-col relative pb-6 transition-all duration-300 ${activeTab !== 'security' ? getAnimClass() : ''}`}
              style={activeTab === 'security' 
                ? { backgroundColor: pinBgColor || primaryColor }
                : !isAnimTmpl ? { background: `linear-gradient(135deg, ${previewBg1} 0%, ${previewBg2} 100%)` } : {}
              }
            >
              
              {activeTab === 'security' ? (
                // PIN EKRANI MOCK PREVIEW
                <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full h-full">
                  {pinImage && (
                    <div className="absolute inset-0 z-0">
                      <img src={pinImage} alt="bg" className="w-full h-full object-cover opacity-60 blur-sm" />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                    </div>
                  )}
                  {!pinImage && (
                    <>
                      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-2xl mix-blend-screen bg-white"></div>
                      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10 blur-2xl mix-blend-screen bg-white"></div>
                    </>
                  )}
                  
                  <div className="relative z-10 w-full backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[1.5rem] p-6 text-center shadow-2xl">
                    <div className="flex justify-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner" style={{ color: pinTextColor || '#ffffff' }}>
                        <Shield className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1 tracking-tight truncate" style={{ color: pinTextColor || '#ffffff' }}>{name || "Profil Adı"}</h3>
                    <p className="text-[10px] mb-6 opacity-80" style={{ color: pinTextColor || '#ffffff' }}>Bu profile erixmek için PIN kodunu girin.</p>
                    
                    <div className="space-y-4">
                      <div className="w-full bg-black/20 border-2 border-white/10 rounded-xl py-3 text-center text-xl tracking-[0.4em] font-bold opacity-70" style={{ color: pinTextColor || '#ffffff' }}>
                        ••••••
                      </div>
                      <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-white text-gray-900 shadow-xl">
                        Kilidi Aç
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // NORMAL PROFİL ÖNİZLEMESİ
                <>
                  {/* Üst Banner */}
                  <div
                    className="w-full h-36 relative transition-colors duration-300 overflow-hidden"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {coverImage && (
                      <img src={coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: coverImageFit as any, objectPosition: coverImagePosition, opacity: coverImageOpacity / 100, transform: `scale(${coverImageZoom / 100})`, transformOrigin: coverImagePosition }} />
                    )}
                  </div>

                  {/* Profil Resmi & Bilgiler */}
                  <div className="px-4 relative -mt-12 flex flex-col items-center text-center">
                    <div
                      className="border-4 shadow-xl flex items-center justify-center text-2xl font-black text-white z-10 transition-all duration-300 overflow-hidden flex-shrink-0"
                      style={{ 
                        backgroundColor: primaryColor,
                        borderColor: profileImageBorderColor || 'rgba(255,255,255,0.2)',
                        width: `${80 * (profileImageSize / 100)}px`,
                        height: `${80 * (profileImageSize / 100)}px`,
                        marginTop: profileImageSize > 100 ? `-${(profileImageSize - 100) * 0.4}px` : '0px',
                        borderRadius: profileImageShape === 'circle' ? '50%' : profileImageShape === 'rounded' ? '16px' : '8px'
                      }}
                    >
                      {profileImage ? (
                        <img src={profileImage} alt={name} style={{ width: '100%', height: '100%', objectFit: profileImageFit as any, objectPosition: profileImagePosition }} />
                      ) : (
                        name ? name.charAt(0).toUpperCase() : "K"
                      )}
                    </div>

                    <div className="mt-3 w-full">
                      <h3 className="text-lg font-black leading-tight" style={{ color: previewNameColor }}>
                        {name || "Ebubekir Kızıldax"}
                      </h3>
                      {title && (
                        <p className="text-xs font-semibold mt-0.5" style={{ color: previewTitleColor }}>
                          {title}
                        </p>
                      )}
                      {companyName && (
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">
                          {companyName}
                        </p>
                      )}
                    </div>

                    {bio && (
                      <p className="mt-2 text-[11px] opacity-75 leading-relaxed max-w-xs line-clamp-3">
                        {bio}
                      </p>
                    )}

                    {/* Butonlar */}
                    <div className="mt-4 flex gap-2 w-full">
                      <div
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-center shadow-md transition-colors duration-300 cursor-pointer"
                        style={{ backgroundColor: previewBtnBg, color: previewBtnText }}
                      >
                        Rehbere Kaydet
                      </div>
                    </div>
                  </div>

                  {/* Modül Listesi Canlı Önizleme (Gerçek Marka İkonlarıyla) */}
                  <div className="px-4 mt-5 space-y-2 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-50 text-center mb-2" style={modulesHeadingColor ? { color: modulesHeadingColor } : {}}>
                      {modulesHeadingText}
                    </p>

                    {modules.map((mod, i) => {
                      const preset = AVAILABLE_MODULES.find(m => m.id === mod.type);
                      return (
                        <div
                          key={i}
                          className="flex items-center p-2.5 rounded-xl border backdrop-blur-xl gap-3 shadow-sm"
                          style={{
                            backgroundColor: mod.bgColor || customModuleBg || (templateStyle === 'minimal' || templateStyle === 'pastel' || templateStyle === 'lavender' ? '#ffffff' : 'rgba(15, 23, 42, 0.8)'),
                            borderColor: customModuleBorder || (templateStyle === 'minimal' || templateStyle === 'pastel' || templateStyle === 'lavender' ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.1)'),
                            color: mod.textColor || customModuleText || (templateStyle === 'minimal' || templateStyle === 'pastel' || templateStyle === 'lavender' ? '#0f172a' : '#ffffff')
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: preset?.color || primaryColor }}
                          >
                            {renderBrandIcon(mod.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{mod.title || preset?.label || "Bağlantı"}</p>
                            <p className="text-[9px] opacity-70 truncate">{mod.url || "Bağlantı adresi..."}</p>
                          </div>
                        </div>
                      );
                    })}

                    {modules.length === 0 && (
                      <div className="text-center py-6 opacity-40 text-[11px]">
                        Bağlantı eklenmedi
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-center w-full pb-4 z-10 relative">
                    <a href="https://sentientwire.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity" style={{ color: previewTitleColor }}>
                      <span className="text-[7px] font-bold tracking-[0.2em] opacity-80" style={{ letterSpacing: '0.2em' }}>ALTYAPI</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-black tracking-widest">SENTIENTWIRE</span>
                        <span className="text-[8px] font-medium tracking-wide opacity-80" style={{ textTransform: 'none' }}>tarafından sağlanmaktadır</span>
                      </div>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

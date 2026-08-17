import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Image from "next/image";
import { cookies } from "next/headers";
import { Share2, Download, Sparkles } from "lucide-react";
import AnalyticsTracker from "./AnalyticsTracker";
import PinProtect from "./PinProtect";
import { AVAILABLE_MODULES } from "@/lib/nfcModules";
import PortfolioTemplate from "../../../components/nfc/templates/portfolio/PortfolioTemplate";

export const revalidate = 0;

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  if (!slug) {
    notFound();
  }

  const profile = await db.nfcProfile.findUnique({
    where: { slug },
    include: {
      modules: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!profile) {
    notFound();
  }

  // Tema & Özel Renk Ayarlarını Ayrıxtır (JSON veya Legacy String)
  let designConfig: any = {};
  try {
    if (profile.themeColor && profile.themeColor.startsWith('{')) {
      designConfig = JSON.parse(profile.themeColor);
    } else {
      const [c, t] = (profile.themeColor || "#2563EB").split(';template=');
      designConfig = { primaryColor: c, templateStyle: t || 'glassmorphism' };
    }
  } catch (e) {
    designConfig = { primaryColor: "#2563EB", templateStyle: 'glassmorphism' };
  }

  // PIN SECURITY LOGIC
  if (profile.isPinActive) {
    const cookieStore = cookies();
    const bypassCookie = (await cookieStore).get('nfc_bypass')?.value;
    
    if (bypassCookie !== slug) {
      return (
        <PinProtect 
          slug={slug} 
          profileName={profile.name} 
          themeColor={designConfig.primaryColor || "#2563EB"}
          designConfig={designConfig}
        />
      );
    }
  }

  // --- NEW PORTFOLIO LAYOUT ---
  if (profile.layout === 'PORTFOLIO') {
    // Dynamic import to avoid SSR issues with framer-motion if needed,
    // or just direct render since it's a client component.
    // We will just return it here.
    return (
      <PortfolioTemplate 
        profile={profile}
        modules={profile.modules}
      />
    );
  }

  const templateStyle = designConfig.templateStyle || "glassmorphism";
  const primaryColor = designConfig.primaryColor || "#2563EB";

  // Renk Özellextirmeleri (Özel belirlenmixse kullan, yoksa xablon varsayılanı)
  const bgGrad1 = designConfig.customBgGrad1 || (
    templateStyle === 'neon' ? '#000000' :
    templateStyle === 'aurora' ? '#311042' :
    templateStyle === 'gold' ? '#0a0a0a' :
    templateStyle === 'emerald' ? '#022c22' :
    templateStyle === 'cosmic' ? '#1e1b4b' :
    templateStyle === 'midnight' ? '#030712' :
    templateStyle === 'minimal' ? '#f8fafc' : '#0f172a'
  );

  const bgGrad2 = designConfig.customBgGrad2 || (
    templateStyle === 'neon' ? '#090d16' :
    templateStyle === 'aurora' ? '#0f172a' :
    templateStyle === 'gold' ? '#171717' :
    templateStyle === 'emerald' ? '#064e3b' :
    templateStyle === 'cosmic' ? '#312e81' :
    templateStyle === 'midnight' ? '#111827' :
    templateStyle === 'minimal' ? '#f1f5f9' : 
    templateStyle === 'sunset' ? '#831843' :
    templateStyle === 'ocean' ? '#064e3b' :
    templateStyle === 'ruby' ? '#2a0410' :
    templateStyle === 'forest' ? '#064e3b' :
    templateStyle === 'cyberblue' ? '#0a0628' :
    templateStyle === 'pastel' ? '#fae8ff' :
    templateStyle === 'monochrome' ? '#09090b' :
    templateStyle === 'luxury_silver' ? '#27272a' :
    templateStyle === 'lavender' ? '#f3e8ff' :
    templateStyle === 'amber' ? '#78350f' :
    templateStyle === 'animated_wave' ? '#0f172a' :
    templateStyle === 'animated_mesh' ? '#be185d' : '#1e1b4b'
  );

  const isLightMode = ['minimal', 'pastel', 'lavender'].includes(templateStyle);

  // Card & Button Default Styles
  let cardClass = isLightMode 
    ? "bg-white border-slate-200 text-slate-900 shadow-md hover:shadow-lg" 
    : "bg-slate-900/80 backdrop-blur-xl border-white/10 text-white shadow-xl";

  if (templateStyle === 'neon') cardClass = "bg-slate-950/90 border-cyan-500/40 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)]";
  if (templateStyle === 'gold') cardClass = "bg-neutral-900/90 border-amber-500/30 text-amber-100 shadow-xl";
  if (templateStyle === 'aurora') cardClass = "bg-purple-900/30 border-purple-400/20 text-white shadow-2xl backdrop-blur-2xl";
  if (templateStyle === 'emerald') cardClass = "bg-emerald-950/60 border-emerald-500/30 text-emerald-100 backdrop-blur-xl";
  if (templateStyle === 'cosmic') cardClass = "bg-indigo-950/60 border-indigo-400/30 text-indigo-100 backdrop-blur-xl";

  const btnBg = designConfig.customBtnBg || primaryColor;
  const btnText = designConfig.customBtnText || "#ffffff";
  const nameColor = designConfig.customNameColor || (isLightMode ? "#0f172a" : "#ffffff");
  const titleColor = designConfig.customTitleColor || (isLightMode ? "#475569" : "rgba(255, 255, 255, 0.8)");
  const cardBg = designConfig.customCardBg || designConfig.customModuleBg || "";
  const cardTextColor = designConfig.customCardText || designConfig.customModuleText || "";
  const cardBorder = designConfig.customModuleBorder || "";
  const profileImageSize = designConfig.profileImageSize || 100;
  const profileImageFit = designConfig.profileImageFit || 'cover';
  const profileImagePosition = designConfig.profileImagePosition || 'center center';
  const profileImageShape = designConfig.profileImageShape || 'circle';
  const profileImageBorderColor = designConfig.profileImageBorderColor || 'rgba(255, 255, 255, 0.2)';

  const modulesHeadingText = designConfig.modulesHeadingText || "Bağlantılar & Sosyal Ağlar";
  const modulesHeadingColor = designConfig.modulesHeadingColor || "";

  const coverImageFit = designConfig.coverImageFit || 'cover';
  const coverImagePosition = designConfig.coverImagePosition || 'center center';
  const coverImageZoom = designConfig.coverImageZoom || 100;
  const coverImageOpacity = designConfig.coverImageOpacity || 90;

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
  const bgAnimClass = getAnimClass();

  return (
    <div 
      className={`min-h-screen w-full sm:max-w-md sm:mx-auto sm:border-x sm:shadow-2xl relative pb-16 transition-all duration-500 ${bgAnimClass}`}
      style={!bgAnimClass ? {
        background: `linear-gradient(135deg, ${bgGrad1} 0%, ${bgGrad2} 100%)`,
        color: isLightMode ? '#0f172a' : '#ffffff'
      } : { color: isLightMode ? '#0f172a' : '#ffffff' }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bgWave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .anim-wave-bg {
          background: linear-gradient(-45deg, ${bgGrad1}, ${bgGrad2}, #312e81, #1e1b4b);
          background-size: 400% 400%;
          animation: bgWave 10s ease infinite;
        }
        .anim-mesh-bg {
          background: linear-gradient(120deg, ${bgGrad1}, ${bgGrad2}, #fb7185, #8b5cf6);
          background-size: 300% 300%;
          animation: bgWave 15s ease infinite;
        }
        .anim-aurora-bg {
          background: linear-gradient(45deg, ${bgGrad1}, ${bgGrad2}, #2dd4bf, #34d399);
          background-size: 400% 400%;
          animation: bgWave 12s ease infinite;
        }
        .anim-plasma-bg {
          background: linear-gradient(135deg, ${bgGrad1}, ${bgGrad2}, #f43f5e, #fb923c);
          background-size: 400% 400%;
          animation: bgWave 8s ease infinite;
        }
        .anim-ocean-bg {
          background: linear-gradient(-135deg, ${bgGrad1}, ${bgGrad2}, #38bdf8, #818cf8);
          background-size: 400% 400%;
          animation: bgWave 14s ease infinite;
        }
        .anim-fire-bg {
          background: linear-gradient(90deg, ${bgGrad1}, ${bgGrad2}, #ef4444, #fcd34d);
          background-size: 300% 300%;
          animation: bgWave 9s ease infinite;
        }
        .anim-galaxy-bg {
          background: linear-gradient(180deg, ${bgGrad1}, ${bgGrad2}, #c084fc, #38bdf8);
          background-size: 400% 400%;
          animation: bgWave 11s ease infinite;
        }
        .anim-avatar { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .anim-title { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; opacity: 0; }
        .anim-button { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards; opacity: 0; }
        .anim-card { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
      `}</style>

      <AnalyticsTracker profileId={profile.id} />
      
      {/* Kapak Görseli Banner */}
      <div 
        className="w-full h-52 relative transition-all duration-500 rounded-b-[2.5rem] overflow-hidden shadow-lg"
        style={{ backgroundColor: primaryColor }}
      >
        {profile.coverImage ? (
          <img 
            src={profile.coverImage} 
            alt="Cover" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: coverImageFit as any, 
              objectPosition: coverImagePosition, 
              opacity: coverImageOpacity / 100, 
              transform: `scale(${coverImageZoom / 100})`, 
              transformOrigin: coverImagePosition 
            }} 
          />
        ) : (
          <div 
            className="w-full h-full opacity-40 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/30 via-transparent to-black/40"
          />
        )}
      </div>

      {/* Profil Avatarı & Bilgileri */}
      <div className="px-6 relative -mt-20 flex flex-col items-center text-center">
        <div 
          className="border-4 shadow-2xl overflow-hidden relative z-10 anim-avatar flex-shrink-0"
          style={{
            borderColor: profileImageBorderColor,
            width: `${128 * (profileImageSize / 100)}px`,
            height: `${128 * (profileImageSize / 100)}px`,
            marginTop: profileImageSize > 100 ? `-${(profileImageSize - 100) * 0.6}px` : '0px',
            borderRadius: profileImageShape === 'circle' ? '50%' : profileImageShape === 'rounded' ? '16px' : '8px'
          }}
        >
          {profile.profileImage ? (
            <img 
              src={profile.profileImage} 
              alt={profile.name} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: profileImageFit as any, 
                objectPosition: profileImagePosition 
              }} 
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-5xl font-black text-white" 
              style={{ backgroundColor: primaryColor }}
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : "K"}
            </div>
          )}
        </div>

        <div className="mt-5 w-full space-y-1 anim-title">
          <h1 className="text-2xl font-black tracking-tight" style={{ color: nameColor }}>
            {profile.name}
          </h1>
          {profile.title && (
            <p className="text-sm font-semibold" style={{ color: titleColor }}>
              {profile.title}
            </p>
          )}
          {profile.companyName && (
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest pt-1">
              {profile.companyName}
            </p>
          )}
        </div>

        {profile.bio && (
          <p className="mt-3 text-xs leading-relaxed opacity-85 max-w-sm mx-auto anim-title" style={{ animationDelay: '0.2s' }}>
            {profile.bio}
          </p>
        )}

        {/* Ana İxlem: Rehbere Kaydet */}
        <div className="mt-6 flex gap-3 w-full anim-button">
          <a 
            href={`/api/nfc/vcard/${profile.slug}`}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all duration-200 active:scale-95 shadow-lg"
            style={{ backgroundColor: btnBg, color: btnText }}
          >
            <Download className="w-4 h-4" />
            Rehbere Kaydet
          </a>
        </div>
      </div>

      {/* Dinamik Modüller (Staggered Entry Animations & Gerçek İkonlar) */}
      <div className="px-6 mt-8 space-y-3">
        <h3 
          className="text-[10px] font-extrabold uppercase tracking-widest opacity-50 mb-4 text-center"
          style={modulesHeadingColor ? { color: modulesHeadingColor } : {}}
        >
          {modulesHeadingText}
        </h3>
        
        {profile.modules.map((mod: any, index: number) => {
          const modDef = AVAILABLE_MODULES.find(m => m.id === mod.type);
          
          if (mod.type === 'gallery') {
            return (
              <div 
                key={mod.id} 
                className="w-full rounded-2xl overflow-hidden shadow-md my-4 border border-white/10 anim-card"
                style={{ animationDelay: `${0.3 + index * 0.08}s` }}
              >
                <img 
                  src={mod.url} 
                  alt={mod.title || "Görsel"} 
                  className="w-full h-auto object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            );
          }

          let finalUrl = mod.url;
          if (mod.type === 'whatsapp' && !finalUrl.includes('wa.me')) {
            finalUrl = `https://wa.me/${finalUrl.replace(/[^0-9]/g, '')}`;
          } else if (mod.type === 'phone' && !finalUrl.includes('tel:')) {
            finalUrl = `tel:${finalUrl.replace(/[^0-9+]/g, '')}`;
          } else if (mod.type === 'email' && !finalUrl.includes('mailto:')) {
            finalUrl = `mailto:${finalUrl}`;
          } else if (!finalUrl.startsWith('http') && !finalUrl.startsWith('tel:') && !finalUrl.startsWith('mailto:')) {
            finalUrl = `https://${finalUrl}`;
          }

          return (
            <a 
              key={mod.id}
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center p-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] anim-card ${cardClass}`}
              style={{ 
                animationDelay: `${0.3 + index * 0.08}s`,
                ...((mod.bgColor || cardBg) ? { backgroundColor: mod.bgColor || cardBg } : {}),
                ...((mod.textColor || cardTextColor) ? { color: mod.textColor || cardTextColor } : {}),
                ...(cardBorder ? { borderColor: cardBorder } : {})
              }}
            >
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110 flex-shrink-0 shadow-sm"
                style={{ backgroundColor: modDef?.color || primaryColor || "#2563EB" }}
              >
                {modDef?.icon || <Sparkles size={18} />}
              </div>
              <div className="ml-3.5 flex-1 min-w-0 pr-2">
                <h4 className="font-bold text-sm truncate" style={mod.textColor ? { color: mod.textColor } : {}}>{mod.title || modDef?.label || "Bağlantı"}</h4>
                <p className="text-[10px] font-medium opacity-60 truncate mt-0.5" style={mod.textColor ? { color: mod.textColor } : {}}>{mod.url}</p>
              </div>
            </a>
          );
        })}

        {profile.modules.length === 0 && (
          <div className="text-center opacity-40 text-xs py-8">
            Henüz eklenmix bağlantı yok.
          </div>
        )}
      </div>

      {/* Powered By */}
      <div className="mt-14 flex justify-center w-full z-10 relative">
        <a href="https://sentientwire.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity" style={{ color: titleColor }}>
          <span className="text-[8px] font-bold tracking-[0.2em] opacity-80" style={{ letterSpacing: '0.2em' }}>ALTYAPI</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] font-black tracking-widest">SENTIENTWIRE</span>
            <span className="text-[9px] font-medium tracking-wide opacity-80" style={{ textTransform: 'none' }}>tarafından sağlanmaktadır</span>
          </div>
        </a>
      </div>
    </div>
  );
}

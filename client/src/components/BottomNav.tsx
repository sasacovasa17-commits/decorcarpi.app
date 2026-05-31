import { useState } from "react";
import { Link } from "wouter";
import {
  Home as HomeIcon,
  Palette,
  FileText,
  Lightbulb,
  Settings,
  Phone,
  Brush,
  Droplets,
  Wind,
  Ruler,
  BarChart3,
} from "lucide-react";

type AppScreen = "home" | "upload" | "visualizer" | "gallery" | "contact" | "inspiration" | "style" | "privacy" | "calculator" | "biancatura" | "Antimuffa" | "preventivo" | "preventivi" | "settings" | "apartment-calc" | "project" | "Vernice" | "texture-gallery" | "texture-comparison" | "texture-collections" | "my-preventives" | "custom-quote" | "paint-editor";

interface BottomNavProps {
  active: AppScreen;
  onNavigate: (s: AppScreen) => void;
  t: any;
  setScreen: (s: AppScreen) => void;
  router: any;
}

export function BottomNav({ active, onNavigate, t, setScreen }: BottomNavProps) {
  const [showPreventivo, setShowPreventivo] = useState(false);

  const preventivos = [
    { id: "calculator" as AppScreen, icon: Brush, label: "Stucchi Decorativi" },
    { id: "Vernice" as AppScreen, icon: Droplets, label: "Vernice" },
    { id: "Antimuffa" as AppScreen, icon: Wind, label: "Antimuffa" },
    { id: "apartment-calc" as AppScreen, icon: Ruler, label: "Inserisci m² Appartamento" },
    { id: "custom-quote" as AppScreen, icon: FileText, label: "Richiesta Preventivo Personalizzato" },
  ];

  // Navigation items configuration
  // type: "link" = wouter Link with URL path
  // type: "screen-link" = Link to /?screen=xxx (internal screen via URL)
  // type: "popup" = opens popup menu (Preventivo)
  // type: "external" = external URL in new tab
  const items = [
    { id: "home" as AppScreen, icon: <HomeIcon size={24} />, label: t.navHome, type: "screen-link" as const, path: "/" },
    { id: "style" as AppScreen, icon: <Palette size={24} />, label: t.styleTabMode, fullLabel: "Combina Stili", type: "screen-link" as const, path: "/?screen=style" },
    { id: "preventivo" as AppScreen, icon: <FileText size={24} />, label: "Prev.", fullLabel: "Preventivo", type: "popup" as const },
    { id: "paint-editor" as AppScreen, icon: <Brush size={24} />, label: "Vernice", fullLabel: "Vernice", type: "link" as const, path: "/paint-editor" },
    { id: "my-preventives" as AppScreen, icon: <FileText size={24} />, label: "Miei", fullLabel: "I Miei Preventivi", type: "link" as const, path: "/my-preventives" },
    { id: "inspiration" as AppScreen, icon: <Lightbulb size={24} />, label: "Inspir.", fullLabel: "Inspirazioni D.C.", type: "screen-link" as const, path: "/ispirazione-dc" },
    { id: "settings" as AppScreen, icon: <Settings size={24} />, label: "Impost.", fullLabel: "Impostazioni", type: "screen-link" as const, path: "/?screen=settings" },
    { id: "contact" as AppScreen, icon: <Phone size={24} />, label: "Cont.", fullLabel: "Contatto", type: "screen-link" as const, path: "/?screen=contact" },
  ];

  const handlePreventivClick = (screenId: AppScreen) => {
    // Navigate to /?screen=xxx for preventivo sub-screens
    window.location.href = `/?screen=${screenId}`;
    setShowPreventivo(false);
  };

  return (
    <>
      {showPreventivo && (
        <div 
          className="fixed bottom-20 left-0 right-0 z-[2147483646] bg-[#1a1a1a] border-t border-b" 
          style={{ borderColor: "rgba(201,162,39,0.2)" }}
        >
          {preventivos.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePreventivClick(p.id)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-[#222] transition-colors flex items-center gap-2"
              style={{ color: "#c9a227", fontFamily: "'Raleway', sans-serif" }}
            >
              <p.icon size={20} className="text-[#c9a227]" />
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div
        className="fixed bottom-0 left-0 right-0 z-[2147483647] flex border-t pointer-events-auto"
        style={{ background: "#0a0a0a", borderColor: "rgba(201,162,39,0.2)" }}
      >
        {items.map((item) => {
          const isActive = active === item.id || (item.id === "preventivo" && showPreventivo);
          const baseClasses = "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all relative hover:scale-110 active:scale-95 group cursor-pointer pointer-events-auto";
          const activeColor = isActive ? "#c9a227" : "#555";
          const fullLabel = (item as any).fullLabel || item.label;

          // Popup type (Preventivo)
          if (item.type === "popup") {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setShowPreventivo(!showPreventivo)}
                className={baseClasses}
                style={{ color: activeColor }}
                title={fullLabel}
              >
                <div className="transition-transform duration-300 hover:rotate-12 group-hover:scale-125">
                  {item.icon}
                </div>
                <span className="text-[10px] font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  {item.label}
                </span>
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-[#1a1a1a] rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)" }}>
                  {fullLabel}
                </div>
              </button>
            );
          }



          // Screen-link type (Combina Stili, Impostazioni, Contatto) - uses <a> with href to /?screen=xxx
          if (item.type === "screen-link") {
            return (
              <a
                key={item.id}
                href={(item as any).path}
                className={baseClasses}
                style={{ color: activeColor, textDecoration: "none" }}
                title={fullLabel}
              >
                <div className="transition-transform duration-300 hover:rotate-12 group-hover:scale-125">
                  {item.icon}
                </div>
                <span className="text-[10px] font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  {item.label}
                </span>
                <div className="absolute bottom-full mb-2 px-2 py-1 bg-[#1a1a1a] rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)" }}>
                  {fullLabel}
                </div>
              </a>
            );
          }

          // Link type (Home, Vernice, Miei) - wouter Link with URL path
          return (
            <Link
              key={item.id}
              href={(item as any).path}
              className={baseClasses}
              style={{ color: activeColor, textDecoration: "none" }}
              title={fullLabel}
            >
              <div className="transition-transform duration-300 hover:rotate-12 group-hover:scale-125">
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold" style={{ fontFamily: "'Raleway', sans-serif" }}>
                {item.label}
              </span>
              <div className="absolute bottom-full mb-2 px-2 py-1 bg-[#1a1a1a] rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ color: "#c9a227", border: "1px solid rgba(201,162,39,0.3)" }}>
                {fullLabel}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

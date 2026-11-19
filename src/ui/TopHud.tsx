import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, BookOpen, Plus, Maximize2, Minimize2, Download } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { formatBig } from '../economy/bigNumber';
import type { ExtractedSprites } from '../engine/spriteExtractor';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface TopHudProps {
  sprites: ExtractedSprites | null;
  onOpenLoreModal: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({ sprites, onOpenLoreModal }) => {
  const gold = useGameStore((s) => s.gold);
  const arcaneStars = useGameStore((s) => s.arcaneStars);
  const gems = useGameStore((s) => s.gems);
  const getTotalGps = useGameStore((s) => s.getTotalGps);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const vipClub = useGameStore((s) => s.vipClub);
  const adBoostEndsAt = useGameStore((s) => s.adBoostEndsAt);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const showToast = useGameStore((s) => s.showToast);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    const onInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      } else {
        await document.exitFullscreen();
      }
    } catch {
      showToast('No Chrome: Menu (⋮) → "Adicionar à tela inicial" abre 100% sem barra!');
    }
  };

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const gps = getTotalGps();
  const adBoostActive = Date.now() < adBoostEndsAt;

  return (
    <header className="slate-hud shrink-0 px-2 pt-[max(0.4rem,env(safe-area-inset-top))] pb-1.5 z-20">
      <div className="flex items-center justify-between gap-1">
        {/* Gold & GPS Counter */}
        <div className="flex-1 min-w-0 bg-[#0F1524] border-2 border-[#2B1810] rounded-xl px-2 py-1 flex items-center gap-1.5 shadow-inner">
          {sprites?.icons.coin ? (
            <img
              src={sprites.icons.coin}
              alt="Ouro"
              className="w-6 h-6 object-contain shrink-0 drop-shadow"
            />
          ) : (
            <span className="text-lg">🪙</span>
          )}
          <div className="min-w-0 leading-tight">
            <div className="font-cartoon text-[15px] text-[#FFE055] cartoon-stroke-sm truncate">
              {formatBig(gold)}
            </div>
            <div className="text-[10px] font-extrabold text-[#34F075] truncate">
              +{formatBig(gps)}/s
              {adBoostActive && (
                <span className="ml-1 px-1 rounded bg-[#1475E1] text-white text-[9px]">×2</span>
              )}
              {vipClub && (
                <span className="ml-1 px-1 rounded bg-[#7C2AE8] text-[#FFE055] text-[9px]">VIP</span>
              )}
            </div>
          </div>
        </div>

        {/* Arcane Stars Counter */}
        <button
          type="button"
          onClick={() => setActiveTab('prestige')}
          className="bg-[#0F1524] border-2 border-[#2B1810] rounded-xl px-1.5 py-1 flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
        >
          {sprites?.icons.star ? (
            <img src={sprites.icons.star} alt="Estrelas" className="w-5 h-5 object-contain" />
          ) : (
            <span className="text-sm">⭐</span>
          )}
          <span className="font-cartoon text-xs text-[#44CEFF] cartoon-stroke-sm">
            {formatBig(arcaneStars)}
          </span>
        </button>

        {/* Amethyst Gems Counter */}
        <button
          type="button"
          onClick={() => setActiveTab('shop')}
          className="bg-[#0F1524] border-2 border-[#2B1810] rounded-xl px-1.5 py-1 flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
        >
          {sprites?.icons.gem ? (
            <img src={sprites.icons.gem} alt="Gemas" className="w-5 h-5 object-contain" />
          ) : (
            <span className="text-sm">💎</span>
          )}
          <span className="font-cartoon text-xs text-[#F3C9FF] cartoon-stroke-sm">{gems}</span>
          <span className="w-3.5 h-3.5 rounded-full bg-[#34F075] border border-[#2B1810] flex items-center justify-center text-[#2B1810]">
            <Plus className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        </button>

        {/* Quick Icons: Install PWA (when available), Fullscreen, Sound, Lore */}
        <div className="flex items-center gap-1 shrink-0">
          {deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallPwa}
              title="Instalar App sem barra"
              className="w-7 h-7 rounded-xl bg-[#12A846] border-2 border-[#2B1810] flex items-center justify-center text-white active:scale-90 animate-pulse"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Tela Cheia (Ocultar barra do navegador)"
            title="Tela Cheia"
            className="w-7 h-7 rounded-xl bg-[#1475E1] border-2 border-[#2B1810] flex items-center justify-center text-white active:scale-90"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-label="Alternar som"
            className="w-7 h-7 rounded-xl bg-[#25304D] border-2 border-[#2B1810] flex items-center justify-center text-[#FAF0D7] active:scale-90"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-[#FF7161]" />}
          </button>
          <button
            type="button"
            onClick={onOpenLoreModal}
            aria-label="Lore e Configurações"
            className="w-7 h-7 rounded-xl bg-[#8C522B] border-2 border-[#2B1810] flex items-center justify-center text-[#FFE055] active:scale-90"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

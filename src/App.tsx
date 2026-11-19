import React, { useEffect, useState } from 'react';
import { Store, Swords, Sparkles, Gift, Gem } from 'lucide-react';
import { useGameStore, type TabId } from './store/useGameStore';
import { getExtractedSprites, type ExtractedSprites } from './engine/spriteExtractor';
import { TavernCanvas } from './engine/TavernCanvas';
import { TopHud } from './ui/TopHud';
import { StationsTab } from './ui/tabs/StationsTab';
import { HeroesTab } from './ui/tabs/HeroesTab';
import { PrestigeTab } from './ui/tabs/PrestigeTab';
import { PassQuestsTab } from './ui/tabs/PassQuestsTab';
import { ShopTab } from './ui/tabs/ShopTab';
import { GameModals } from './ui/Modals';

const NAV_ITEMS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; activeBg: string }[] = [
  { id: 'stations', label: 'Taverna', icon: Store, activeBg: 'btn-emerald' },
  { id: 'heroes', label: 'Heróis', icon: Swords, activeBg: 'btn-sapphire' },
  { id: 'prestige', label: 'Ascensão', icon: Sparkles, activeBg: 'btn-amethyst' },
  { id: 'pass', label: 'Passe', icon: Gift, activeBg: 'btn-amber' },
  { id: 'shop', label: 'Loja', icon: Gem, activeBg: 'btn-coral' },
];

export const App: React.FC = () => {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const toastMessage = useGameStore((s) => s.toastMessage);
  const chestKeys = useGameStore((s) => s.chestKeys);

  const [sprites, setSprites] = useState<ExtractedSprites | null>(null);
  const [loreOpen, setLoreOpen] = useState(false);

  // Load saved game & extract transparent cartoon sprites on startup
  useEffect(() => {
    useGameStore.getState().loadGame();
    getExtractedSprites()
      .then((res) => setSprites(res))
      .catch(() => {});
  }, []);

  // Fixed-rate simulation tick (10Hz) & periodic autosave (5s)
  useEffect(() => {
    let last = performance.now();
    const simTimer = setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.5);
      last = now;
      useGameStore.getState().tick(dt);
    }, 100);

    const saveTimer = setInterval(() => {
      useGameStore.getState().saveGame();
    }, 5000);

    const handleHide = () => useGameStore.getState().saveGame();
    document.addEventListener('visibilitychange', handleHide);
    window.addEventListener('beforeunload', handleHide);

    return () => {
      clearInterval(simTimer);
      clearInterval(saveTimer);
      document.removeEventListener('visibilitychange', handleHide);
      window.removeEventListener('beforeunload', handleHide);
    };
  }, []);

  return (
    <div className="h-dvh w-full bg-[#070B14] flex justify-center overflow-hidden">
      {/* Mobile Portrait Shell (full bleed on phones, framed on tablets/desktops) */}
      <div className="relative w-full max-w-[490px] h-full flex flex-col bg-[#121829] shadow-[0_0_50px_rgba(0,0,0,0.85)] sm:border-x-[3px] sm:border-[#2B1810]">
        {/* Top Currency & Utility HUD */}
        <TopHud sprites={sprites} onOpenLoreModal={() => setLoreOpen(true)} />

        {/* Interactive PixiJS v8 Hand-Painted Cartoon Tavern Stage */}
        <TavernCanvas sprites={sprites} />

        {/* Scrollable Content Panel */}
        <main className="flex-1 min-h-0 overflow-y-auto tavern-scroll px-2.5 pt-2.5 bg-gradient-to-b from-[#172038] via-[#131A2D] to-[#0D1322]">
          {activeTab === 'stations' && <StationsTab sprites={sprites} />}
          {activeTab === 'heroes' && <HeroesTab sprites={sprites} />}
          {activeTab === 'prestige' && <PrestigeTab />}
          {activeTab === 'pass' && <PassQuestsTab />}
          {activeTab === 'shop' && <ShopTab sprites={sprites} />}
        </main>

        {/* Cartoon Glossy Bottom Navigation Bar (Thumb Zone) */}
        <nav className="slate-hud shrink-0 border-t-[3px] border-[#2B1810] px-1.5 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] grid grid-cols-5 gap-1.5 z-20">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative rounded-xl py-1.5 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  active
                    ? `btn-cartoon ${item.activeBg} -translate-y-1 text-white`
                    : 'bg-[#1D2740] border-2 border-[#2B1810] text-[#FAF0D7]/75 active:scale-95'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-cartoon text-[10px] cartoon-stroke-sm leading-none">
                  {item.label}
                </span>
                {item.id === 'shop' && chestKeys > 0 && (
                  <span className="absolute -top-1.5 -right-1 w-4 h-4 rounded-full bg-[#FFE055] text-[#2B1810] border border-[#2B1810] font-black text-[9px] flex items-center justify-center">
                    {chestKeys}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Floating Toast Feedback */}
        {toastMessage && (
          <div className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px]">
            <div className="gold-frame rounded-2xl px-3.5 py-2 text-center font-cartoon text-xs text-[#FFE055] cartoon-stroke-sm shadow-2xl">
              {toastMessage}
            </div>
          </div>
        )}

        {/* Modals (Tutorial, Offline Earnings, Chest Reveal, Lore Codex) */}
        <GameModals sprites={sprites} loreOpen={loreOpen} onCloseLore={() => setLoreOpen(false)} />
      </div>
    </div>
  );
};

export default App;

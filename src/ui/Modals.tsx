import React from 'react';
import { X, Sparkles, BookOpen, Trash2, Save } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { TUTORIAL_STEPS, RARITY_COLORS, BASE_BIOMES } from '../lore/gameData';
import { formatBig } from '../economy/bigNumber';
import { CartoonButton } from './CartoonButton';
import type { ExtractedSprites } from '../engine/spriteExtractor';

interface ModalsProps {
  sprites: ExtractedSprites | null;
  loreOpen: boolean;
  onCloseLore: () => void;
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${Math.max(1, m)} min`;
}

export const GameModals: React.FC<ModalsProps> = ({ sprites, loreOpen, onCloseLore }) => {
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const advanceTutorial = useGameStore((s) => s.advanceTutorial);
  const skipTutorial = useGameStore((s) => s.skipTutorial);

  const offlinePopup = useGameStore((s) => s.offlinePopup);
  const claimOfflinePopup = useGameStore((s) => s.claimOfflinePopup);
  const noAds = useGameStore((s) => s.noAds);

  const chestModal = useGameStore((s) => s.chestModal);
  const closeChestModal = useGameStore((s) => s.closeChestModal);

  const floor = useGameStore((s) => s.floor);
  const highestFloor = useGameStore((s) => s.highestFloor);
  const totalGold = useGameStore((s) => s.totalGold);
  const saveGame = useGameStore((s) => s.saveGame);
  const showToast = useGameStore((s) => s.showToast);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <>
      {/* 1. Narrative Tutorial Overlay */}
      {tutorialStep >= 0 && tutorialStep < TUTORIAL_STEPS.length && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4">
          {(() => {
            const step = TUTORIAL_STEPS[tutorialStep];
            const portrait = sprites?.heroes[step.spriteKey];
            return (
              <div className="w-full max-w-sm wood-panel rounded-3xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[#FFE055]">
                    Crônica Inicial ({tutorialStep + 1}/{TUTORIAL_STEPS.length})
                  </span>
                  <button
                    type="button"
                    onClick={skipTutorial}
                    className="text-xs font-extrabold text-[#FAF0D7]/70 underline"
                  >
                    Pular
                  </button>
                </div>

                <div className="parchment-card rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#25304D] border-2 border-[#2B1810] flex items-center justify-center shrink-0">
                    {portrait ? (
                      <img src={portrait} alt={step.speaker} className="w-14 h-14 object-contain" />
                    ) : (
                      <span className="text-3xl">🍺</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase text-[#7C2AE8]">
                      {step.speaker}
                    </div>
                    <h3 className="font-cartoon text-base text-[#3A2010] leading-tight">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm font-extrabold text-[#FAF0D7] leading-relaxed px-1">
                  {step.text}
                </p>

                <CartoonButton
                  variant="emerald"
                  sheen
                  fullWidth
                  size="md"
                  onClick={() => {
                    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                      document.documentElement
                        .requestFullscreen({ navigationUI: 'hide' })
                        .catch(() => {});
                    }
                    advanceTutorial();
                  }}
                >
                  {step.cta}
                </CartoonButton>
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. Offline Earnings Welcome-Back Popup */}
      {offlinePopup && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm wood-panel rounded-3xl p-4 text-center space-y-3">
            <div className="font-cartoon text-xl text-[#FFE055] cartoon-stroke">
              🍺 Bem-vindo de Volta!
            </div>
            <p className="text-xs font-extrabold text-[#FAF0D7]">
              Sua equipe manteve a taverna fervendo por{' '}
              <span className="text-[#44CEFF]">{formatDuration(offlinePopup.secondsAway)}</span>{' '}
              (limite {offlinePopup.cappedHours}h)!
            </p>
            <div className="parchment-card rounded-2xl py-3 px-4">
              <div className="text-[11px] font-black uppercase text-[#6B3B1C]">Ouro Acumulado</div>
              <div className="font-cartoon text-3xl text-[#F2990A] cartoon-stroke mt-0.5">
                🪙 +{formatBig(offlinePopup.goldEarned)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CartoonButton variant="sapphire" size="md" onClick={() => claimOfflinePopup(false)}>
                COLETAR
              </CartoonButton>
              <CartoonButton
                variant="emerald"
                sheen
                size="md"
                onClick={() => claimOfflinePopup(true)}
              >
                {noAds ? '⚡ DOBRAR ×2' : '📺 DOBRAR ×2'}
              </CartoonButton>
            </div>
          </div>
        </div>
      )}

      {/* 3. Animated Chest Opening Reveal Modal */}
      {chestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          {(() => {
            const rc = RARITY_COLORS[chestModal.rarity];
            const portrait = sprites?.heroes[chestModal.hero.spriteKey];
            return (
              <div
                className="w-full max-w-xs rounded-3xl p-5 text-center border-[3px] shadow-2xl space-y-3"
                style={{
                  borderColor: rc.border,
                  background: `radial-gradient(circle at top, ${rc.bg}, #111626 78%)`,
                }}
              >
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-xs font-black text-[#FFE055]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {chestModal.isNew ? 'NOVO HERÓI DESBLOQUEADO!' : 'FUSÃO DE ESTRELA!'}
                </div>

                <div className="mx-auto w-28 h-28 rounded-3xl bg-[#FAF0D7] border-[3px] border-[#2B1810] flex items-center justify-center shadow-xl animate-gentle-pulse">
                  {portrait ? (
                    <img
                      src={portrait}
                      alt={chestModal.hero.name}
                      className="w-24 h-24 object-contain"
                    />
                  ) : (
                    <span className="text-5xl">🌟</span>
                  )}
                </div>

                <div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white border border-[#2B1810]"
                    style={{ backgroundColor: rc.badge }}
                  >
                    {chestModal.rarity}
                  </span>
                  <h3 className="font-cartoon text-xl text-white cartoon-stroke mt-1">
                    {chestModal.hero.name}
                  </h3>
                  <div className="text-xs font-black text-[#FFE055] mt-0.5">
                    ⭐ Agora com {chestModal.newStars} Estrela{chestModal.newStars > 1 ? 's' : ''}!
                  </div>
                  <div className="text-xs font-extrabold text-[#34F075] mt-1">
                    Bônus do Baú: +{chestModal.bonusGems} Gemas 💎
                  </div>
                </div>

                <CartoonButton variant="amber" sheen fullWidth size="md" onClick={closeChestModal}>
                  INCRÍVEL! ✨
                </CartoonButton>
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. Lore Codex & Settings Modal */}
      {loreOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="w-full max-w-md max-h-[85vh] wood-panel rounded-3xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-cartoon text-lg text-[#FFE055] cartoon-stroke-sm flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Crônicas & Opções
              </div>
              <button
                type="button"
                onClick={onCloseLore}
                className="w-8 h-8 rounded-xl bg-[#D93025] border-2 border-[#2B1810] flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto tavern-scroll space-y-2.5 pr-1">
              <div className="parchment-card rounded-2xl p-3 space-y-1.5 text-xs font-bold leading-relaxed">
                <h4 className="font-cartoon text-sm text-[#3A2010]">
                  📜 O Mito do Caldeirão Dourado
                </h4>
                <p>
                  Há mil anos, o arquimago-cozinheiro <strong>Aurelius, o Saciador</strong>, forjou
                  o Caldeirão de Éter Infinito na encruzilhada de <strong>Brasa Clara</strong> para
                  encerrar guerras com um banquete lendário. Hoje, <strong>Barnabé</strong> reacendeu
                  suas brasas e descobriu que a taverna cresce verticalmente por dimensões infinitas!
                </p>
                <h4 className="font-cartoon text-sm text-[#8A1710] pt-1">
                  ⚔️ A Guilda do Sal Seco
                </h4>
                <p>
                  Liderada pelo avarento <strong>Barão Malakor</strong>, o sindicato tenta taxar a
                  magia gastronômica de Valória. Derrote seus fiscais na aba Heróis para saquear
                  Gemas e expandir a Torre Infinita!
                </p>
              </div>

              {/* Biomes Progress Gallery */}
              <div className="bg-[#151C2E] border-2 border-[#2B1810] rounded-2xl p-3 space-y-2">
                <div className="font-cartoon text-xs text-[#44CEFF]">
                  🗺️ MAPA DOS REINOS INFINITOS (Andar Atual: {floor} • Recorde: {highestFloor})
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {BASE_BIOMES.map((b) => {
                    const reached = highestFloor >= b.floorStart;
                    return (
                      <div
                        key={b.id}
                        className={`rounded-xl p-2 border ${
                          reached
                            ? 'bg-[#25304D] border-[#34F075]/70'
                            : 'bg-[#0F1524] border-white/10 opacity-60'
                        }`}
                      >
                        <div className="font-cartoon text-xs text-[#FFE055] truncate">{b.name}</div>
                        <div className="text-[10px] font-extrabold text-[#FAF0D7]/80">
                          Andares {b.floorStart}–{b.floorEnd} {reached ? '✓' : '🔒'}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] font-extrabold text-[#F3C9FF] text-center">
                  ♾️ Andar 251+: Ciclos Dimensionais Ômega Infinitos (Ω-1, Ω-2, Ω-∞)!
                </div>
              </div>

              {/* Stats & Save Controls */}
              <div className="bg-[#151C2E] border-2 border-[#2B1810] rounded-2xl p-3 space-y-2">
                <div className="text-xs font-extrabold text-[#FAF0D7]">
                  Ouro Total Acumulado na História:{' '}
                  <span className="text-[#FFE055]">{formatBig(totalGold)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <CartoonButton
                    variant="emerald"
                    size="xs"
                    onClick={() => {
                      saveGame();
                      showToast('💾 Progresso salvo com sucesso!');
                    }}
                  >
                    <Save className="w-3.5 h-3.5" /> Salvar Agora
                  </CartoonButton>
                  <CartoonButton
                    variant="coral"
                    size="xs"
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja zerar todo o seu progresso?')) {
                        resetGame();
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reiniciar Save
                  </CartoonButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useEffect, useState } from 'react';
import Decimal from 'break_eternity.js';
import { Swords, Star } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { HEROES, RARITY_COLORS, BARON_BOSSES } from '../../lore/gameData';
import { formatBig } from '../../economy/bigNumber';
import { CartoonButton } from '../CartoonButton';
import type { ExtractedSprites } from '../../engine/spriteExtractor';

interface HeroesTabProps {
  sprites: ExtractedSprites | null;
}

export const HeroesTab: React.FC<HeroesTabProps> = ({ sprites }) => {
  const gold = useGameStore((s) => s.gold);
  const heroStars = useGameStore((s) => s.heroStars);
  const bossStage = useGameStore((s) => s.bossStage);
  const raidCooldownEndsAt = useGameStore((s) => s.raidCooldownEndsAt);
  const hireOrUpgradeHero = useGameStore((s) => s.hireOrUpgradeHero);
  const fightBaronRaid = useGameStore((s) => s.fightBaronRaid);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  const [now, setNow] = useState(Date.now());
  const [expandedLoreId, setExpandedLoreId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const raidRemaining = Math.max(0, Math.ceil((raidCooldownEndsAt - now) / 1000));
  const currentBoss = BARON_BOSSES[(bossStage - 1) % BARON_BOSSES.length];

  return (
    <div className="space-y-2.5 pb-4">
      {/* Barão Malakor Raid Card */}
      <div className="rounded-2xl p-3 border-[2.5px] border-[#2B1810] bg-gradient-to-br from-[#5E161E] via-[#3A1018] to-[#1D0C14] shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D93025] border border-[#2B1810] text-[10px] font-black text-white mb-1">
              <Swords className="w-3 h-3" /> INVASÃO #{bossStage} • GUILDA DO SAL SECO
            </div>
            <h3 className="font-cartoon text-base text-[#FFE055] cartoon-stroke-sm">
              {currentBoss.name}
            </h3>
            <p className="text-[11px] font-bold text-[#FFC7C0] italic mt-0.5">
              &ldquo;{currentBoss.taunt}&rdquo;
            </p>
          </div>
          <CartoonButton
            variant="coral"
            sheen={raidRemaining === 0}
            size="sm"
            disabled={raidRemaining > 0}
            onClick={fightBaronRaid}
            className="shrink-0 mt-1"
          >
            {raidRemaining > 0 ? `⏳ ${raidRemaining}s` : '⚔️ DEFENDER!'}
          </CartoonButton>
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-extrabold text-[#FAF0D7]/90">
          <span>
            Recompensa: 💎 +{currentBoss.rewardGems + Math.floor(bossStage * 0.5)} Gemas + Saque 3m
          </span>
          {(heroStars['cedric'] || 0) > 0 && (
            <span className="text-[#FFE055]">Sir Cedric +40% ativo!</span>
          )}
        </div>
      </div>

      {/* Hero Lineup */}
      <div className="font-cartoon text-xs text-[#FAF0D7] cartoon-stroke-sm px-1">
        ELENCO DE HERÓIS & GERENTES (FUSÃO INFINITA)
      </div>

      <div className="space-y-2">
        {HEROES.map((hero) => {
          const stars = heroStars[hero.id] || 0;
          const isExclusive = hero.hireGoldCost.lte(0);
          const cost = isExclusive
            ? new Decimal(0)
            : hero.hireGoldCost.mul(Decimal.pow(40, stars)).floor();
          const canAfford = !isExclusive && gold.gte(cost);
          const rc = RARITY_COLORS[hero.rarity];
          const portrait = sprites?.heroes[hero.spriteKey];
          const showLore = expandedLoreId === hero.id;
          const activeMult = 1 + hero.bonusPerStar * stars;

          return (
            <div
              key={hero.id}
              className="rounded-2xl p-2.5 border-[2.5px] border-[#2B1810] shadow-md"
              style={{ background: `linear-gradient(180deg, ${rc.bg} 0%, #151C2E 100%)` }}
            >
              <div className="flex items-center gap-2.5">
                {/* Hand-Painted Hero Portrait */}
                <button
                  type="button"
                  onClick={() => setExpandedLoreId(showLore ? null : hero.id)}
                  className="relative w-14 h-14 rounded-2xl bg-[#FAF0D7] border-2 border-[#2B1810] flex items-center justify-center shrink-0 overflow-hidden shadow-inner"
                >
                  {portrait ? (
                    <img
                      src={portrait}
                      alt={hero.name}
                      className={`w-12 h-12 object-contain ${stars === 0 ? 'opacity-65 grayscale-[0.4]' : ''}`}
                    />
                  ) : (
                    <span className="text-2xl">🧙</span>
                  )}
                  <span
                    className="absolute bottom-0 inset-x-0 text-[8px] font-black uppercase text-center text-white py-0.5"
                    style={{ backgroundColor: rc.badge }}
                  >
                    {hero.rarity}
                  </span>
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-cartoon text-sm text-white cartoon-stroke-sm truncate">
                      {hero.name}
                    </h4>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-[#FFE055] shrink-0">
                      <Star className="w-3.5 h-3.5 fill-[#FFE055] text-[#2B1810]" /> {stars}
                    </span>
                  </div>
                  <div className="text-[10px] font-extrabold text-[#44CEFF]">
                    {hero.race} • {hero.title}
                  </div>
                  <div className="text-[11px] font-bold text-[#FAF0D7]/90 mt-0.5 leading-snug">
                    {hero.bonusText}
                  </div>
                </div>

                {/* Action Button */}
                {isExclusive ? (
                  <CartoonButton
                    variant="amethyst"
                    size="xs"
                    onClick={() => setActiveTab('shop')}
                    className="shrink-0"
                  >
                    BAÚ 💎
                  </CartoonButton>
                ) : (
                  <CartoonButton
                    variant={stars === 0 ? 'emerald' : 'sapphire'}
                    size="xs"
                    disabled={!canAfford}
                    onClick={() => hireOrUpgradeHero(hero.id)}
                    className="min-w-[78px] shrink-0"
                  >
                    <div className="text-center leading-tight">
                      <div className="text-[10px]">{stars === 0 ? 'CONTRATAR' : 'FUNDIR ★'}</div>
                      <div className="text-[10px] text-[#FFF7C2]">🪙 {formatBig(cost)}</div>
                    </div>
                  </CartoonButton>
                )}
              </div>

              {/* Expandable Lore Strip */}
              <div className="mt-1.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExpandedLoreId(showLore ? null : hero.id)}
                  className="text-[10px] font-extrabold text-[#FFE055]/85 underline"
                >
                  {showLore ? 'Ocultar Crônica' : '📖 Ler Lore do Personagem'}
                </button>
                {stars > 0 && (
                  <span className="text-[10px] font-black text-[#34F075]">
                    Bônus Global: ×{activeMult.toFixed(2)}
                  </span>
                )}
              </div>

              {showLore && (
                <div className="mt-2 parchment-card rounded-xl p-2 text-[11px] font-bold leading-relaxed">
                  {hero.lore}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

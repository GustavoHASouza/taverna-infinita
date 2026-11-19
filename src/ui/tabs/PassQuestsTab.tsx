import React from 'react';
import { Crown, Lock, Check } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { BATTLE_PASS_TIERS } from '../../lore/gameData';
import { CartoonButton } from '../CartoonButton';

export const PassQuestsTab: React.FC = () => {
  const passXp = useGameStore((s) => s.passXp);
  const goldenPass = useGameStore((s) => s.goldenPass);
  const claimedFreeTiers = useGameStore((s) => s.claimedFreeTiers);
  const claimedGoldTiers = useGameStore((s) => s.claimedGoldTiers);
  const tapsCount = useGameStore((s) => s.tapsCount);
  const upgradesCount = useGameStore((s) => s.upgradesCount);
  const highestFloor = useGameStore((s) => s.highestFloor);
  const raidsWon = useGameStore((s) => s.raidsWon);
  const questClaimedLevel = useGameStore((s) => s.questClaimedLevel);
  const claimQuest = useGameStore((s) => s.claimQuest);
  const claimPassReward = useGameStore((s) => s.claimPassReward);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  const quests = [
    {
      id: 'taps' as const,
      title: 'Servir Rodadas no Salão',
      emoji: '🍺',
      current: tapsCount,
      target: (questClaimedLevel.taps + 1) * 40,
      rewardGems: 10 + questClaimedLevel.taps * 4,
    },
    {
      id: 'upgrades' as const,
      title: 'Evoluir Estações da Taverna',
      emoji: '🔨',
      current: upgradesCount,
      target: (questClaimedLevel.upgrades + 1) * 20,
      rewardGems: 10 + questClaimedLevel.upgrades * 4,
    },
    {
      id: 'floors' as const,
      title: 'Expandir Andares da Torre',
      emoji: '🏰',
      current: highestFloor,
      target: (questClaimedLevel.floors + 1) * 3,
      rewardGems: 10 + questClaimedLevel.floors * 4,
    },
    {
      id: 'raids' as const,
      title: 'Derrotar Guilda do Sal Seco',
      emoji: '⚔️',
      current: raidsWon,
      target: (questClaimedLevel.raids + 1) * 2,
      rewardGems: 10 + questClaimedLevel.raids * 4,
    },
  ];

  return (
    <div className="space-y-3 pb-4">
      {/* Infinite Quests */}
      <div>
        <div className="font-cartoon text-xs text-[#FAF0D7] cartoon-stroke-sm px-1 mb-1.5">
          🎯 MISSÕES INFINITAS (GEMAS & XP DO PASSE)
        </div>
        <div className="space-y-2">
          {quests.map((q) => {
            const done = q.current >= q.target;
            const pct = Math.min(100, (q.current / q.target) * 100);
            return (
              <div
                key={q.id}
                className="parchment-card rounded-2xl p-2.5 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-cartoon text-xs text-[#3A2010] flex items-center gap-1.5">
                    <span>{q.emoji}</span>
                    <span className="truncate">{q.title}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#3A2010]/20 rounded-full overflow-hidden border border-[#3A2010]/40">
                      <div
                        className="h-full bg-gradient-to-r from-[#1475E1] to-[#44CEFF]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-[#6B3B1C]">
                      {Math.min(q.current, q.target)}/{q.target}
                    </span>
                  </div>
                </div>
                <CartoonButton
                  variant="emerald"
                  sheen={done}
                  size="xs"
                  disabled={!done}
                  onClick={() => claimQuest(q.id)}
                  className="shrink-0"
                >
                  💎 +{q.rewardGems}
                </CartoonButton>
              </div>
            );
          })}
        </div>
      </div>

      {/* Battle Pass Header */}
      <div className="gold-frame rounded-2xl p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-cartoon text-sm text-[#FFE055] cartoon-stroke-sm flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#FFE055]" /> PASSE DO CALDEIRÃO
            </div>
            <div className="text-[11px] font-extrabold text-[#FAF0D7]/90">
              Seu XP de Temporada: <span className="text-[#34F075]">{passXp} XP</span>
            </div>
          </div>
          {!goldenPass ? (
            <CartoonButton
              variant="amber"
              sheen
              size="xs"
              onClick={() => setActiveTab('shop')}
            >
              ATIVAR DOURADO
            </CartoonButton>
          ) : (
            <span className="px-2 py-1 rounded-xl bg-[#FFE055] text-[#2B1810] font-cartoon text-xs">
              👑 ATIVO
            </span>
          )}
        </div>

        {/* Pass Tiers */}
        <div className="mt-2.5 space-y-1.5">
          {BATTLE_PASS_TIERS.map((tier) => {
            const unlocked = passXp >= tier.xpRequired;
            const freeClaimed = claimedFreeTiers.includes(tier.level);
            const goldClaimed = claimedGoldTiers.includes(tier.level);

            return (
              <div
                key={tier.level}
                className="bg-[#151C2E]/90 border-2 border-[#2B1810] rounded-xl p-2 grid grid-cols-[44px_1fr_1fr] items-center gap-2"
              >
                <div className="text-center">
                  <div className="font-cartoon text-xs text-[#FFE055]">Nv.{tier.level}</div>
                  <div className="text-[9px] font-bold text-[#FAF0D7]/60">{tier.xpRequired}XP</div>
                </div>

                {/* Free Track */}
                <button
                  type="button"
                  disabled={!unlocked || freeClaimed}
                  onClick={() => claimPassReward(tier.level, 'free')}
                  className={`rounded-lg px-2 py-1.5 border text-left transition-all ${
                    freeClaimed
                      ? 'bg-[#0F1524] border-[#34F075]/40 text-[#34F075]'
                      : unlocked
                        ? 'bg-[#18C254]/25 border-[#34F075] text-white animate-pulse'
                        : 'bg-[#0F1524]/70 border-white/10 text-white/50'
                  }`}
                >
                  <div className="text-[9px] uppercase font-black text-[#44CEFF]">Grátis</div>
                  <div className="text-[11px] font-extrabold flex items-center justify-between">
                    <span className="truncate">{tier.freeLabel}</span>
                    {freeClaimed && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                </button>

                {/* Golden Premium Track */}
                <button
                  type="button"
                  disabled={!unlocked || goldClaimed}
                  onClick={() => claimPassReward(tier.level, 'gold')}
                  className={`rounded-lg px-2 py-1.5 border text-left transition-all ${
                    goldClaimed
                      ? 'bg-[#0F1524] border-[#FFE055]/40 text-[#FFE055]'
                      : unlocked && goldenPass
                        ? 'bg-[#FFE055]/25 border-[#FFE055] text-[#FFF7C2] animate-pulse'
                        : 'bg-[#291B0C]/70 border-[#FFE055]/30 text-[#FFE055]/70'
                  }`}
                >
                  <div className="text-[9px] uppercase font-black text-[#FFE055] flex items-center gap-1">
                    {!goldenPass && <Lock className="w-2.5 h-2.5" />} Dourado
                  </div>
                  <div className="text-[11px] font-extrabold flex items-center justify-between">
                    <span className="truncate">{tier.goldLabel}</span>
                    {goldClaimed && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

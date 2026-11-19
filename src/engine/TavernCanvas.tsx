import React, { useEffect, useRef, useState } from 'react';
import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { useGameStore } from '../store/useGameStore';
import { getBiomeForFloor, HEROES } from '../lore/gameData';
import { formatBig } from '../economy/bigNumber';
import type { ExtractedSprites } from './spriteExtractor';
import { CartoonButton } from '../ui/CartoonButton';

interface FloatingPop {
  id: number;
  x: number;
  y: number;
  text: string;
  isCrit: boolean;
}

interface AmbientParticle {
  g: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  baseSize: number;
}

interface FlyingCoin {
  sprite: Sprite;
  startX: number;
  startY: number;
  ctrlX: number;
  ctrlY: number;
  targetX: number;
  targetY: number;
  t: number;
  speed: number;
  spin: number;
}

interface HeroActor {
  heroId: string;
  sprite: Sprite;
  anchorX: number;
  anchorY: number;
  phase: number;
  jumpVel: number;
  jumpOffset: number;
}

interface TavernCanvasProps {
  sprites: ExtractedSprites | null;
}

export const TavernCanvas: React.FC<TavernCanvasProps> = ({ sprites }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const bgSpriteRef = useRef<Sprite | null>(null);
  const glowRef = useRef<Graphics | null>(null);
  const heroContainerRef = useRef<Container | null>(null);
  const fxContainerRef = useRef<Container | null>(null);
  const coinTexRef = useRef<Texture | null>(null);
  const ambientRef = useRef<AmbientParticle[]>([]);
  const coinsRef = useRef<FlyingCoin[]>([]);
  const actorsRef = useRef<Map<string, HeroActor>>(new Map());
  const biomeIdRef = useRef<number>(-1);
  const particleColorsRef = useRef<number[]>([0xffd84d, 0xff8c24, 0xfff5b8]);
  const feverActiveRef = useRef<boolean>(false);

  const [pops, setPops] = useState<FloatingPop[]>([]);
  const [speechBubble, setSpeechBubble] = useState<{ text: string; speaker: string } | null>(null);
  const popIdRef = useRef(0);

  const floor = useGameStore((s) => s.floor);
  const heroStars = useGameStore((s) => s.heroStars);
  const stationLevels = useGameStore((s) => s.stationLevels);
  const feverCharge = useGameStore((s) => s.feverCharge);
  const feverEndsAt = useGameStore((s) => s.feverEndsAt);
  const tapTavern = useGameStore((s) => s.tapTavern);
  const activateFever = useGameStore((s) => s.activateFever);
  const getTapPower = useGameStore((s) => s.getTapPower);

  const tapPower = getTapPower();
  void stationLevels;
  const biome = getBiomeForFloor(floor);
  const now = Date.now();
  const isFeverActive = now < feverEndsAt;
  const feverRemainingSec = isFeverActive ? Math.ceil((feverEndsAt - now) / 1000) : 0;

  useEffect(() => {
    feverActiveRef.current = isFeverActive;
  }, [isFeverActive]);

  // Initialize PixiJS v8 Application
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let destroyed = false;
    const app = new Application();

    const initPixi = async () => {
      try {
        await app.init({
          resizeTo: host,
          backgroundAlpha: 0,
          antialias: true,
          preference: 'webgl',
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        });
      } catch {
        return;
      }

      if (destroyed) {
        app.destroy(true);
        return;
      }

      host.innerHTML = '';
      host.appendChild(app.canvas);
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      app.canvas.style.display = 'block';
      appRef.current = app;

      const bgLayer = new Container();
      const glowLayer = new Container();
      const heroLayer = new Container();
      const fxLayer = new Container();

      app.stage.addChild(bgLayer, glowLayer, heroLayer, fxLayer);
      heroContainerRef.current = heroLayer;
      fxContainerRef.current = fxLayer;

      const bgSprite = new Sprite(Texture.EMPTY);
      bgSprite.anchor.set(0.5);
      bgLayer.addChild(bgSprite);
      bgSpriteRef.current = bgSprite;

      // Ambient warm hearth/cauldron glow overlay
      const glow = new Graphics();
      glowLayer.addChild(glow);
      glowRef.current = glow;

      // Seed ambient floating particles
      const particles: AmbientParticle[] = [];
      for (let i = 0; i < 28; i++) {
        const g = new Graphics();
        const size = 2 + Math.random() * 3.5;
        g.circle(0, 0, size).fill({ color: 0xffd84d, alpha: 0.9 });
        g.x = Math.random() * app.screen.width;
        g.y = Math.random() * app.screen.height;
        fxLayer.addChild(g);
        particles.push({
          g,
          vx: (Math.random() - 0.5) * 14,
          vy: -(12 + Math.random() * 26),
          life: Math.random() * 3,
          maxLife: 2 + Math.random() * 2.5,
          baseSize: size,
        });
      }
      ambientRef.current = particles;

      let elapsed = 0;
      app.ticker.add((ticker) => {
        const dt = Math.min(ticker.deltaMS / 1000, 0.05);
        elapsed += dt;
        const w = app.screen.width;
        const h = app.screen.height;

        // Keep background smoothly covering the stage with subtle breathing zoom
        if (bgSprite.texture && bgSprite.texture !== Texture.EMPTY) {
          const tw = bgSprite.texture.width || 1;
          const th = bgSprite.texture.height || 1;
          const coverScale = Math.max(w / tw, h / th) * (1.03 + Math.sin(elapsed * 0.5) * 0.008);
          bgSprite.scale.set(coverScale);
          bgSprite.x = w * 0.5;
          bgSprite.y = h * 0.54;
        }

        // Pulsing warm/magical ambient light glow
        glow.clear();
        const pulse = 0.14 + Math.sin(elapsed * 3.2) * 0.05 + (feverActiveRef.current ? 0.14 : 0);
        const glowColor = feverActiveRef.current ? 0xffd84d : particleColorsRef.current[0];
        glow.circle(w * 0.82, h * 0.86, w * 0.34).fill({ color: glowColor, alpha: pulse });
        glow.circle(w * 0.16, h * 0.8, w * 0.28).fill({ color: 0xff8c24, alpha: pulse * 0.85 });

        // Animate ambient particles
        const colors = particleColorsRef.current;
        for (const p of ambientRef.current) {
          p.life += dt;
          const speedBoost = feverActiveRef.current ? 2.4 : 1;
          p.g.x += (p.vx + Math.sin(elapsed * 2 + p.baseSize) * 8) * dt;
          p.g.y += p.vy * speedBoost * dt;

          const ratio = p.life / p.maxLife;
          p.g.alpha = ratio < 0.2 ? ratio * 5 : Math.max(0, (1 - ratio) * 1.1);

          if (p.life >= p.maxLife || p.g.y < -10) {
            p.life = 0;
            p.g.x = Math.random() * w;
            p.g.y = h * (0.65 + Math.random() * 0.38);
            const col = feverActiveRef.current
              ? 0xffe055
              : colors[Math.floor(Math.random() * colors.length)];
            p.g.clear();
            p.g.circle(0, 0, p.baseSize * (feverActiveRef.current ? 1.35 : 1)).fill({
              color: col,
              alpha: 0.95,
            });
          }
        }

        // Animate hired hero sprites bobbing & jumping in the tavern
        actorsRef.current.forEach((actor) => {
          if (actor.jumpOffset < 0 || actor.jumpVel !== 0) {
            actor.jumpOffset += actor.jumpVel * dt;
            actor.jumpVel += 640 * dt;
            if (actor.jumpOffset >= 0) {
              actor.jumpOffset = 0;
              actor.jumpVel = 0;
            }
          }
          const bob = Math.sin(elapsed * 3.1 + actor.phase) * 3.5;
          const squash = 1 + Math.sin(elapsed * 3.1 + actor.phase) * 0.03;
          actor.sprite.x = w * actor.anchorX;
          actor.sprite.y = h * actor.anchorY + bob + actor.jumpOffset;
          const targetH = Math.min(h * 0.27, 86);
          const baseScale = targetH / Math.max(actor.sprite.texture.height || 100, 1);
          actor.sprite.scale.set(baseScale * (2 - squash), baseScale * squash);
        });

        // Animate flying coins along Bézier curves up to the HUD
        const activeCoins = coinsRef.current;
        for (let i = activeCoins.length - 1; i >= 0; i--) {
          const c = activeCoins[i];
          c.t += dt * c.speed;
          if (c.t >= 1) {
            fxLayer.removeChild(c.sprite);
            c.sprite.destroy();
            activeCoins.splice(i, 1);
            continue;
          }
          const inv = 1 - c.t;
          c.sprite.x = inv * inv * c.startX + 2 * inv * c.t * c.ctrlX + c.t * c.t * c.targetX;
          c.sprite.y = inv * inv * c.startY + 2 * inv * c.t * c.ctrlY + c.t * c.t * c.targetY;
          c.sprite.rotation += c.spin * dt;
          const sc = c.t < 0.2 ? 0.5 + c.t * 2.5 : 1 - (c.t - 0.2) * 0.55;
          c.sprite.scale.set(Math.max(0.2, sc * 0.34));
          c.sprite.alpha = c.t > 0.82 ? (1 - c.t) / 0.18 : 1;
        }
      });
    };

    initPixi();

    return () => {
      destroyed = true;
      actorsRef.current.clear();
      coinsRef.current = [];
      ambientRef.current = [];
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // Load Biome Background Texture whenever Biome changes
  useEffect(() => {
    particleColorsRef.current = biome.particleColors;
    const loadBg = async () => {
      try {
        const tex = await Assets.load<Texture>(biome.bgImage);
        if (bgSpriteRef.current) {
          bgSpriteRef.current.texture = tex;
          bgSpriteRef.current.tint = biome.tintHex ?? 0xffffff;
        }
        biomeIdRef.current = biome.id;
      } catch {
        // Ignore transient load error
      }
    };
    if (biomeIdRef.current !== biome.id || bgSpriteRef.current?.texture === Texture.EMPTY) {
      loadBg();
    }
  }, [biome.id, biome.bgImage, biome.tintHex, biome.particleColors]);

  // Sync Coin Texture & Hired Hero Sprites into PixiJS stage
  useEffect(() => {
    if (!sprites || !heroContainerRef.current) return;

    let cancelled = false;
    const syncSprites = async () => {
      if (!coinTexRef.current && sprites.icons.coin) {
        try {
          coinTexRef.current = await Assets.load<Texture>(sprites.icons.coin);
        } catch {
          // fallback
        }
      }

      const heroLayer = heroContainerRef.current;
      if (!heroLayer || cancelled) return;

      // Always show Barnabé welcoming the player from the start, plus all hired heroes
      const visibleIds = HEROES.filter(
        (h) => h.id === 'barnabe' || (heroStars[h.id] || 0) > 0
      ).slice(0, 5);

      for (const h of visibleIds) {
        if (actorsRef.current.has(h.id)) continue;
        const dataUrl = sprites.heroes[h.spriteKey];
        if (!dataUrl) continue;
        try {
          const tex = await Assets.load<Texture>(dataUrl);
          if (cancelled || !heroContainerRef.current) return;
          const sp = new Sprite(tex);
          sp.anchor.set(0.5, 1);
          heroContainerRef.current.addChild(sp);
          actorsRef.current.set(h.id, {
            heroId: h.id,
            sprite: sp,
            anchorX: h.canvasAnchor.x,
            anchorY: h.canvasAnchor.y,
            phase: Math.random() * Math.PI * 2,
            jumpVel: 0,
            jumpOffset: 0,
          });
        } catch {
          // ignore
        }
      }
    };

    syncSprites();
    return () => {
      cancelled = true;
    };
  }, [sprites, heroStars]);

  // Occasional charming lore speech bubbles from hired heroes
  useEffect(() => {
    const timer = setInterval(() => {
      const hired = HEROES.filter((h) => h.id === 'barnabe' || (heroStars[h.id] || 0) > 0);
      if (hired.length === 0) return;
      const pick = hired[Math.floor(Math.random() * hired.length)];
      const line = pick.speechLines[Math.floor(Math.random() * pick.speechLines.length)];
      setSpeechBubble({ speaker: pick.name.split(' ')[0], text: line });
      setTimeout(() => setSpeechBubble(null), 3200);
    }, 9000);
    return () => clearInterval(timer);
  }, [heroStars]);

  const spawnTapCoins = (x: number, y: number, count: number) => {
    const fxLayer = fxContainerRef.current;
    const app = appRef.current;
    const tex = coinTexRef.current;
    if (!fxLayer || !app || !tex) return;

    for (let i = 0; i < count; i++) {
      const sp = new Sprite(tex);
      sp.anchor.set(0.5);
      sp.x = x;
      sp.y = y;
      fxLayer.addChild(sp);

      coinsRef.current.push({
        sprite: sp,
        startX: x,
        startY: y,
        ctrlX: x + (Math.random() - 0.5) * 140,
        ctrlY: Math.max(10, y - 70 - Math.random() * 80),
        targetX: app.screen.width * 0.24,
        targetY: 8,
        t: 0,
        speed: 1.35 + Math.random() * 0.6,
        spin: (Math.random() - 0.5) * 12,
      });
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { gained, isCrit } = tapTavern();

    // Make tavern heroes hop happily!
    actorsRef.current.forEach((actor) => {
      if (actor.jumpOffset === 0) {
        actor.jumpVel = -(180 + Math.random() * 90);
      }
    });

    spawnTapCoins(x, y, isCrit ? 9 : 4);

    const id = ++popIdRef.current;
    const label = isCrit ? `💥 CRÍTICO! +${formatBig(gained)}` : `+${formatBig(gained)}`;
    setPops((prev) => [...prev.slice(-10), { id, x, y, text: label, isCrit }]);
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== id));
    }, 850);
  };

  return (
    <div
      className="relative w-full h-[38vh] min-h-[235px] max-h-[340px] shrink-0 overflow-hidden border-b-[3px] border-[#2B1810] bg-[#151C2E] cursor-pointer"
      onPointerDown={handleCanvasPointerDown}
    >
      {/* Instant Hand-Painted Cartoon Backdrop (Frame-0 + WebGL Fallback) */}
      <img
        src={biome.bgImage}
        alt={biome.name}
        className="pointer-events-none absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* PixiJS Hardware-Accelerated Canvas */}
      <div ref={hostRef} className="absolute inset-0 w-full h-full" />

      {/* Bottom warm vignette so HUD badges pop cleanly */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B0F1A]/85 via-[#0B0F1A]/30 to-transparent" />

      {/* Biome & Floor Floating Ribbon */}
      <div className="pointer-events-none absolute top-2 left-2.5 right-2.5 flex items-center justify-between gap-2">
        <div className="wood-panel rounded-xl px-2.5 py-1 flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-[#2B1810]"
            style={{ backgroundColor: biome.accentHex }}
          />
          <div className="leading-tight">
            <div className="font-cartoon text-[13px] text-[#FFE055] cartoon-stroke-sm">
              {biome.name}
            </div>
            <div className="text-[10px] font-extrabold text-[#FAF0D7]/90">
              Andar {floor} • {biome.subtitle}
            </div>
          </div>
        </div>

        {/* Tap Power Pill */}
        <div className="slate-hud rounded-xl px-2.5 py-1 border-2 border-[#2B1810] text-right">
          <div className="text-[9px] uppercase font-black tracking-wider text-[#44CEFF]">
            Toque na Taverna
          </div>
          <div className="font-cartoon text-xs text-[#FFE055] cartoon-stroke-sm">
            +{formatBig(tapPower)} / toque
          </div>
        </div>
      </div>

      {/* Hero Lore Speech Bubble */}
      {speechBubble && (
        <div className="pointer-events-none absolute top-14 left-3 max-w-[210px] parchment-card rounded-2xl rounded-bl-sm px-2.5 py-1.5 text-[11px] font-extrabold shadow-lg animate-bounce">
          <span className="text-[#8C522B]">{speechBubble.speaker}:</span> {speechBubble.text}
        </div>
      )}

      {/* Golden Fever Meter / Activation Button */}
      <div
        className="absolute bottom-2.5 right-2.5 left-2.5 flex items-end justify-between gap-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none text-[10px] font-extrabold text-[#FAF0D7]/90 bg-[#151C2E]/75 border border-[#2B1810] rounded-lg px-2 py-1">
          👆 Toque no salão para servir clientes!
        </div>

        {isFeverActive ? (
          <div className="gold-frame rounded-xl px-3 py-1.5 animate-gentle-pulse">
            <div className="font-cartoon text-xs text-[#FFE055] cartoon-stroke-sm">
              🔥 FEBRE DOURADA! {feverRemainingSec}s
            </div>
          </div>
        ) : feverCharge >= 100 ? (
          <CartoonButton
            variant="amber"
            sheen
            size="sm"
            className="animate-gentle-pulse"
            onClick={activateFever}
          >
            🔥 ATIVAR FEBRE ×{(heroStars['ignis'] || 0) > 0 ? '3.5' : '3'}!
          </CartoonButton>
        ) : (
          <div className="bg-[#151C2E]/85 border-2 border-[#2B1810] rounded-xl px-2.5 py-1 min-w-[122px]">
            <div className="flex justify-between text-[9px] font-black text-[#FFE055] mb-0.5">
              <span>🔥 CALDEIRÃO</span>
              <span>{Math.floor(feverCharge)}%</span>
            </div>
            <div className="h-2 w-full bg-[#0B0F1A] rounded-full overflow-hidden border border-[#2B1810]">
              <div
                className="h-full bg-gradient-to-r from-[#FF7161] via-[#FFE055] to-[#FFF7C2] transition-all duration-150"
                style={{ width: `${Math.min(100, feverCharge)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Tap Profit Numbers */}
      {pops.map((p) => (
        <div
          key={p.id}
          style={{ left: p.x, top: p.y }}
          className={`pointer-events-none absolute font-cartoon animate-float-pop whitespace-nowrap ${
            p.isCrit
              ? 'text-xl text-[#FFE055] cartoon-stroke-lg'
              : 'text-base text-[#FFF7C2] cartoon-stroke'
          }`}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
};

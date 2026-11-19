import Decimal from 'break_eternity.js';

export type Rarity =
  | 'Comum'
  | 'Raro'
  | 'Épico'
  | 'Lendário'
  | 'Mítico'
  | 'Celestial'
  | 'Eterno';

export const RARITY_COLORS: Record<
  Rarity,
  { bg: string; border: string; text: string; badge: string }
> = {
  Comum: { bg: '#3b4252', border: '#9aa5b1', text: '#e5e9f0', badge: '#64748b' },
  Raro: { bg: '#133a6e', border: '#44ceff', text: '#c2eeff', badge: '#1475e1' },
  Épico: { bg: '#3f1568', border: '#d361ff', text: '#f3c9ff', badge: '#7c2ae8' },
  Lendário: { bg: '#5c3605', border: '#ffe055', text: '#fff7c2', badge: '#e68a00' },
  Mítico: { bg: '#61131a', border: '#ff7161', text: '#ffc7c0', badge: '#d93025' },
  Celestial: { bg: '#0c4352', border: '#5efce8', text: '#d0fff9', badge: '#0891b2' },
  Eterno: { bg: '#3b1054', border: '#ff9ef5', text: '#fff0fe', badge: '#db2777' },
};

export interface BiomeDef {
  id: number;
  name: string;
  subtitle: string;
  floorStart: number;
  floorEnd: number;
  bgImage: string;
  accentHex: string;
  particleColors: number[];
  ambientGlow: number;
  tintHex?: number;
  loreQuote: string;
  profitMultiplier: Decimal;
}

export const BASE_BIOMES: BiomeDef[] = [
  {
    id: 0,
    name: 'Brasa Clara',
    subtitle: 'Taverna de Carvalho',
    floorStart: 1,
    floorEnd: 25,
    bgImage: 'art/bg_brasa_clara.jpg',
    accentHex: '#f59e0b',
    particleColors: [0xffd84d, 0xff8c24, 0xfff5b8],
    ambientGlow: 0xffa62b,
    loreQuote: 'Onde o Caldeirão de Aurelius reacendeu sua primeira fagulha dourada.',
    profitMultiplier: new Decimal(1),
  },
  {
    id: 1,
    name: 'Estufa de Sylvandor',
    subtitle: 'Santuário Bioluminescente',
    floorStart: 26,
    floorEnd: 50,
    bgImage: 'art/bg_sylvandor.jpg',
    accentHex: '#2ee66b',
    particleColors: [0x5efce8, 0x34f075, 0xc2ffe0],
    ambientGlow: 0x32f5c8,
    loreQuote: 'Raízes ancestrais abraçam a torre e fermentam elixires sob a luz da lua.',
    profitMultiplier: new Decimal(3),
  },
  {
    id: 2,
    name: 'Forja de Khaz-Ouro',
    subtitle: 'Cervejaria de Magma',
    floorStart: 51,
    floorEnd: 100,
    bgImage: 'art/bg_khaz_ouro.jpg',
    accentHex: '#ff6b35',
    particleColors: [0xff6b35, 0xffd23f, 0xff3c00],
    ambientGlow: 0xff7722,
    loreQuote: 'Engrenagens de latão e rios de ouro derretido temperam cada barril anão.',
    profitMultiplier: new Decimal(12),
  },
  {
    id: 3,
    name: 'Observatório Astral',
    subtitle: 'Salão das Nebulosas',
    floorStart: 101,
    floorEnd: 250,
    bgImage: 'art/bg_astral.jpg',
    accentHex: '#c855ff',
    particleColors: [0xd361ff, 0x44ceff, 0xffe055],
    ambientGlow: 0xb95cff,
    loreQuote: 'A taverna rompe o véu dos céus e serve viajantes de mil constelações.',
    profitMultiplier: new Decimal(60),
  },
];

const OMEGA_ADJECTIVES = [
  'Prismática',
  'Solaris',
  'Esmeralda Eterna',
  'Rubi Cósmica',
  'Estelar Suprema',
  'Aureliana',
  'Hiperdimensional',
];

const OMEGA_TINTS = [0xffe4ff, 0xd4fff7, 0xfff0c4, 0xffd4dc, 0xd8d4ff, 0xd4ffd8];

export function getBiomeForFloor(floor: number): BiomeDef {
  if (floor <= 25) return BASE_BIOMES[0];
  if (floor <= 50) return BASE_BIOMES[1];
  if (floor <= 100) return BASE_BIOMES[2];
  if (floor <= 250) return BASE_BIOMES[3];

  const omegaIndex = Math.floor((floor - 251) / 50) + 1;
  const adj = OMEGA_ADJECTIVES[(omegaIndex - 1) % OMEGA_ADJECTIVES.length];
  const tint = OMEGA_TINTS[(omegaIndex - 1) % OMEGA_TINTS.length];
  const cycleBg = BASE_BIOMES[(omegaIndex + 2) % BASE_BIOMES.length].bgImage;

  return {
    id: 3 + omegaIndex,
    name: `Dimensão Ω-${omegaIndex}`,
    subtitle: `Taverna ${adj}`,
    floorStart: 251 + (omegaIndex - 1) * 50,
    floorEnd: 250 + omegaIndex * 50,
    bgImage: cycleBg,
    accentHex: '#ff66e5',
    particleColors: [0xff7ce5, 0x5efce8, 0xffe055],
    ambientGlow: 0xd361ff,
    tintHex: tint,
    loreQuote: `Ciclo Infinito Ω-${omegaIndex}: O Banquete Cósmico ecoa além do espaço-tempo!`,
    profitMultiplier: Decimal.pow(5, omegaIndex).mul(60),
  };
}

export interface StationDef {
  id: string;
  name: string;
  iconKey: 'mug' | 'potion' | 'coin' | 'star' | 'gem';
  emoji: string;
  desc: string;
  baseCost: Decimal;
  baseGps: Decimal;
  growthRate: number;
  managerHeroId: string;
}

/**
 * Classic Cookie Clicker / AdVenture Capitalist Idle Pacing:
 * Universal ~1.15-1.16 cost growth and progressive payback (30s -> 1800s).
 */
export const STATIONS: StationDef[] = [
  {
    id: 'ale_bar',
    name: 'Balcão de Hidromel',
    iconKey: 'mug',
    emoji: '🍺',
    desc: 'Canecas espumantes com a receita lendária de Aurelius.',
    baseCost: new Decimal(15),
    baseGps: new Decimal(0.5),
    growthRate: 1.15,
    managerHeroId: 'barnabe',
  },
  {
    id: 'cauldron',
    name: 'Caldeirão Alquímico',
    iconKey: 'potion',
    emoji: '🧪',
    desc: 'Poções cintilantes que curam fadiga e multiplicam gorjetas.',
    baseCost: new Decimal(250),
    baseGps: new Decimal(4),
    growthRate: 1.15,
    managerHeroId: 'lyra',
  },
  {
    id: 'grill',
    name: 'Cozinha de Brasa',
    iconKey: 'coin',
    emoji: '🍖',
    desc: 'Espetos temperados com fogo de dragão pelo Chef Zephyr.',
    baseCost: new Decimal(4500),
    baseGps: new Decimal(32),
    growthRate: 1.155,
    managerHeroId: 'zephyr',
  },
  {
    id: 'forge',
    name: 'Bancada de Forja',
    iconKey: 'star',
    emoji: '⚒️',
    desc: 'Afia espadas e encanta escudos enquanto os heróis comem.',
    baseCost: new Decimal(85000),
    baseGps: new Decimal(260),
    growthRate: 1.155,
    managerHeroId: 'cedric',
  },
  {
    id: 'quests_board',
    name: 'Mural de Contratos',
    iconKey: 'star',
    emoji: '📜',
    desc: 'Comissões reais de caçadas contra a Guilda do Sal Seco.',
    baseCost: new Decimal(1800000),
    baseGps: new Decimal(2400),
    growthRate: 1.16,
    managerHeroId: 'cedric',
  },
  {
    id: 'vip_lounge',
    name: 'Camarote VIP Real',
    iconKey: 'gem',
    emoji: '👑',
    desc: 'Recebe Nobres, Arquimagos e Dragões pagando em ouro puro.',
    baseCost: new Decimal(45000000),
    baseGps: new Decimal(25000),
    growthRate: 1.16,
    managerHeroId: 'ignis',
  },
];

export function getStationVisualTier(level: number): { label: string; color: string } {
  if (level >= 150) return { label: 'Encantada', color: '#d361ff' };
  if (level >= 75) return { label: 'Dourada', color: '#ffe055' };
  if (level >= 25) return { label: 'Decorada', color: '#34f075' };
  return { label: 'Simples', color: '#94a3b8' };
}

export interface HeroDef {
  id: string;
  name: string;
  title: string;
  race: string;
  rarity: Rarity;
  spriteKey: 'barnabe' | 'lyra' | 'cedric' | 'zephyr' | 'ignis';
  hireGoldCost: Decimal;
  bonusText: string;
  /** Additive global bonus summed across all heroes: 1 + sum(bonusPerStar * stars) */
  bonusPerStar: number;
  lore: string;
  speechLines: string[];
  canvasAnchor: { x: number; y: number };
}

export const HEROES: HeroDef[] = [
  {
    id: 'barnabe',
    name: 'Barnabé Barba-de-Malte',
    title: 'Mestre Taverneiro',
    race: 'Anão',
    rarity: 'Raro',
    spriteKey: 'barnabe',
    hireGoldCost: new Decimal(1500),
    bonusText: '+25% lucro global & +20% no Balcão por estrela',
    bonusPerStar: 0.25,
    lore: 'Herdeiro da Taverna da Encruzilhada, reacendeu o Caldeirão de Aurelius e jurou servir o melhor hidromel dos nove reinos.',
    speechLines: ['Espuma na medida certa!', 'Mais uma rodada, herói!', 'O Barão não nos para!'],
    canvasAnchor: { x: 0.24, y: 0.76 },
  },
  {
    id: 'lyra',
    name: 'Lyra Folha-de-Luar',
    title: 'Alquimista Chefe',
    race: 'Elfa',
    rarity: 'Épico',
    spriteKey: 'lyra',
    hireGoldCost: new Decimal(35000),
    bonusText: '+35% lucro global & dobra chance de Toque Crítico',
    bonusPerStar: 0.35,
    lore: 'Estudou botânica mágica em Sylvandor. Suas poções brilham tanto que dispensam velas nas mesas.',
    speechLines: ['Cuidado, borbulha!', 'Poção crítica pronta!', 'Essência pura de lua!'],
    canvasAnchor: { x: 0.45, y: 0.72 },
  },
  {
    id: 'zephyr',
    name: 'Zephyr Fogo-Alto',
    title: 'Chef de Cozinha',
    race: 'Goblin',
    rarity: 'Épico',
    spriteKey: 'zephyr',
    hireGoldCost: new Decimal(900000),
    bonusText: '+50% lucro global & +20% na Cozinha por estrela',
    bonusPerStar: 0.5,
    lore: 'Expulso da Guilda do Sal Seco por se recusar a fazer comida sem tempero, virou o chef mais disputado de Valória.',
    speechLines: ['FOGO ALTO! HEHE!', 'Espeto estalando!', 'Sal seco nunca mais!'],
    canvasAnchor: { x: 0.67, y: 0.75 },
  },
  {
    id: 'cedric',
    name: 'Sir Cedric',
    title: 'Paladino Dourado',
    race: 'Humano',
    rarity: 'Lendário',
    spriteKey: 'cedric',
    hireGoldCost: new Decimal(30000000),
    bonusText: '+75% lucro global & +40% gemas contra o Barão',
    bonusPerStar: 0.75,
    lore: 'Defensor juramentado das tortas quentes e dos aventureiros cansados. Sua armadura reluz como ouro recém-cunhado.',
    speechLines: ['Pela honra da Taverna!', 'Expedição vitoriosa!', 'Justiça e hidromel!'],
    canvasAnchor: { x: 0.34, y: 0.85 },
  },
  {
    id: 'ignis',
    name: 'Ignis, a Brasa Real',
    title: 'Dragãozinho do Caldeirão',
    race: 'Dragão',
    rarity: 'Mítico',
    spriteKey: 'ignis',
    hireGoldCost: new Decimal(2000000000),
    bonusText: '+120% lucro global & Febre Dourada dura +8s com ×3.5!',
    bonusPerStar: 1.2,
    lore: 'Chocou dentro das brasas ancestrais de Aurelius. Cada espirro de fogo transforma o caldeirão em ouro líquido.',
    speechLines: ['*Puff!* 🔥', 'Caldeirão quentinho!', 'Mais ouro brilhante!'],
    canvasAnchor: { x: 0.82, y: 0.83 },
  },
  {
    id: 'aurelius_echo',
    name: 'Eco de Aurelius',
    title: 'Arquimago Fundador',
    race: 'Celestial',
    rarity: 'Celestial',
    spriteKey: 'lyra',
    hireGoldCost: new Decimal(0),
    bonusText: '+200% lucro global & +25% Estrelas Arcanas por estrela',
    bonusPerStar: 2.0,
    lore: 'Um fragmento astral do próprio criador do Caldeirão Dourado, manifestado para guiar a taverna pelas Dimensões Ω.',
    speechLines: ['O Banquete é eterno!', 'Ascenda além das estrelas!'],
    canvasAnchor: { x: 0.56, y: 0.65 },
  },
  {
    id: 'solaris_titan',
    name: 'Soberano Solaris Ω',
    title: 'Guardião do Infinito',
    race: 'Entidade Eterna',
    rarity: 'Eterno',
    spriteKey: 'cedric',
    hireGoldCost: new Decimal(0),
    bonusText: '+350% lucro global em TODOS os Biomas e Dimensões Ω',
    bonusPerStar: 3.5,
    lore: 'Senhor das Constelações Douradas que visita apenas tavernas lendárias capazes de atravessar o infinito.',
    speechLines: ['Infinito servido!', 'Sabor cósmico supremo!'],
    canvasAnchor: { x: 0.14, y: 0.68 },
  },
];

export interface PrestigeUpgradeDef {
  id: string;
  layer: 1 | 2 | 3 | 4;
  name: string;
  desc: string;
  baseCost: Decimal;
  growth: number;
  maxLevel: number; // 0 = infinite
  icon: string;
}

export const PRESTIGE_UPGRADES: PrestigeUpgradeDef[] = [
  // Layer 1: Estrelas Arcanas
  {
    id: 'star_recipe',
    layer: 1,
    name: 'Receita Secreta de Aurelius',
    desc: 'Multiplica TODO o ouro ganho em ×1.5 por nível (escala infinita).',
    baseCost: new Decimal(10),
    growth: 2.6,
    maxLevel: 0,
    icon: '🍺',
  },
  {
    id: 'star_tap',
    layer: 1,
    name: 'Canecas Relâmpago',
    desc: 'Cada toque na taverna rende +1% extra do seu GPS atual por nível.',
    baseCost: new Decimal(15),
    growth: 2.8,
    maxLevel: 0,
    icon: '⚡',
  },
  {
    id: 'star_crit',
    layer: 1,
    name: 'Espuma Crítica Dourada',
    desc: 'Aumenta o multiplicador de Críticos de ×5 para +×2 por nível.',
    baseCost: new Decimal(25),
    growth: 3.0,
    maxLevel: 0,
    icon: '💥',
  },
  // Layer 2: Essência Dimensional
  {
    id: 'dim_autobuyer',
    layer: 2,
    name: 'Autômato Gerente de Salão',
    desc: 'Desbloqueia Auto-Compra de estações automaticamente!',
    baseCost: new Decimal(10),
    growth: 5,
    maxLevel: 1,
    icon: '🤖',
  },
  {
    id: 'dim_star_boost',
    layer: 2,
    name: 'Fornalha Dimensional',
    desc: 'Multiplica ganho de Estrelas Arcanas e Ouro em ×2 por nível.',
    baseCost: new Decimal(12),
    growth: 2.8,
    maxLevel: 0,
    icon: '🌌',
  },
  // Layer 3: Fragmentos Cósmicos
  {
    id: 'cos_autoprestige',
    layer: 3,
    name: 'Núcleo de Auto-Prestígio',
    desc: 'Gera +2% das Estrelas Arcanas pendentes por segundo sem resetar!',
    baseCost: new Decimal(8),
    growth: 4,
    maxLevel: 1,
    icon: '🌀',
  },
  {
    id: 'cos_mega',
    layer: 3,
    name: 'Harmonia das Esferas',
    desc: 'Multiplica TODA produção em ×3 por nível (infinito).',
    baseCost: new Decimal(10),
    growth: 3.0,
    maxLevel: 0,
    icon: '🪐',
  },
  // Layer 4: Sementes Eternas (Ciclo Ômega)
  {
    id: 'omega_eternity',
    layer: 4,
    name: 'Bênção do Banquete Eterno Ω',
    desc: 'Multiplica o poder global em ×5 por nível, sem limite!',
    baseCost: new Decimal(3),
    growth: 2.8,
    maxLevel: 0,
    icon: '♾️',
  },
];

export interface TutorialStep {
  speaker: string;
  spriteKey: 'barnabe' | 'lyra' | 'cedric' | 'zephyr' | 'ignis';
  title: string;
  text: string;
  cta: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    speaker: 'Barnabé Barba-de-Malte',
    spriteKey: 'barnabe',
    title: 'Começando do Zero!',
    text: 'Pelos barris de meu avô! Começamos com 0 moedas no bolso, mas o Caldeirão de Aurelius ainda está quente! Toque no salão da taverna para servir as primeiras canecas na mão e juntar 15 moedas!',
    cta: 'Reacender a Lareira! 🔥',
  },
  {
    speaker: 'Barnabé Barba-de-Malte',
    spriteKey: 'barnabe',
    title: 'Evolução Estratégica',
    text: 'Evolua suas estações até os marcos (Nv. 25, 50, 100) para dobrar o lucro! Contrate heróis para acelerar a produção e ascenda quando atingir 1M de ouro.',
    cta: 'Entendido! 🍺',
  },
  {
    speaker: 'Barão Malakor (Guilda do Sal Seco)',
    spriteKey: 'zephyr',
    title: 'Ameaça do Sindicato!',
    text: '"Hmph! Vou taxar cada gota de hidromel desta espelunca!" — Derrote os fiscais do Barão na aba Heróis, suba os andares da torre e conquiste novos Reinos!',
    cta: 'Vamos Construir o Império! 👑',
  },
];

export interface PassRewardTier {
  level: number;
  xpRequired: number;
  freeLabel: string;
  freeType: 'gems' | 'keys' | 'warp';
  freeAmount: number;
  goldLabel: string;
  goldType: 'gems' | 'keys' | 'warp';
  goldAmount: number;
}

export const BATTLE_PASS_TIERS: PassRewardTier[] = [
  { level: 1, xpRequired: 30, freeLabel: '20 Gemas', freeType: 'gems', freeAmount: 20, goldLabel: '80 Gemas', goldType: 'gems', goldAmount: 80 },
  { level: 2, xpRequired: 80, freeLabel: '1 Chave Épica', freeType: 'keys', freeAmount: 1, goldLabel: '2 Chaves Épicas', goldType: 'keys', goldAmount: 2 },
  { level: 3, xpRequired: 160, freeLabel: 'Warp 30min', freeType: 'warp', freeAmount: 1800, goldLabel: '180 Gemas', goldType: 'gems', goldAmount: 180 },
  { level: 4, xpRequired: 280, freeLabel: '35 Gemas', freeType: 'gems', freeAmount: 35, goldLabel: 'Warp 4h', goldType: 'warp', goldAmount: 14400 },
  { level: 5, xpRequired: 450, freeLabel: '1 Chave Épica', freeType: 'keys', freeAmount: 1, goldLabel: '400 Gemas', goldType: 'gems', goldAmount: 400 },
  { level: 6, xpRequired: 700, freeLabel: 'Warp 2h', freeType: 'warp', freeAmount: 7200, goldLabel: '4 Chaves Épicas', goldType: 'keys', goldAmount: 4 },
  { level: 7, xpRequired: 1050, freeLabel: '60 Gemas', freeType: 'gems', freeAmount: 60, goldLabel: 'Warp 12h', goldType: 'warp', goldAmount: 43200 },
  { level: 8, xpRequired: 1500, freeLabel: '2 Chaves Épicas', freeType: 'keys', freeAmount: 2, goldLabel: '1.000 Gemas', goldType: 'gems', goldAmount: 1000 },
];

export const BARON_BOSSES = [
  { name: 'Fiscal Goblin Pão-Duro', taunt: 'Cadê o alvará da espuma?!', rewardGems: 10 },
  { name: 'Golem Cobrador de Impostos', taunt: 'TAXA DE CALDEIRÃO: 900%!', rewardGems: 14 },
  { name: 'Inspetor Cinzento de Malakor', taunt: 'Comida com sabor é proibida!', rewardGems: 18 },
  { name: 'Dragão da Dívida Pública', taunt: 'Entreguem as canecas douradas!', rewardGems: 24 },
  { name: 'Barão Malakor em Pessoa', taunt: 'Eu vou comprar sua taverna!', rewardGems: 32 },
];

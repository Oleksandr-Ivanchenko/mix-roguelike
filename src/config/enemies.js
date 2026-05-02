export const ENEMY_TYPES = {
  basic: {
    key: "skeleton",
    hp: 60, damage: 12, speed: 90, xp: 10,
    scale: 1.0, tint: 0xffffff,
    label: "Скелет",
    behavior: "chase"
  },
  fast: {
    key: "skeleton",
    hp: 30, damage: 10, speed: 160, xp: 15,
    scale: 0.75, tint: 0xffbb44,
    label: "Быстрый скелет",
    behavior: "flank"
  },
  tank: {
    key: "cultist",
    hp: 220, damage: 22, speed: 55, xp: 28,
    scale: 1.35, tint: 0xffffff,
    label: "Культист-страж",
    behavior: "chase"
  },
  shooter: {
    key: "cultist",
    hp: 50, damage: 16, speed: 60, xp: 22,
    scale: 0.9, tint: 0xaaddff,
    label: "Культист-маг",
    ranged: true, shootCooldown: 1800, bulletSpeed: 220,
    behavior: "kite"
  },
  flanker: {
    key: "skeleton",
    hp: 45, damage: 14, speed: 140, xp: 18,
    scale: 0.85, tint: 0xff88aa,
    label: "Фланкер",
    behavior: "flank"
  },
  boss: {
    key: "gargonaBoss",
    hp: 600, damage: 30, speed: 65, xp: 120,
    scale: 2.0, tint: 0xffffff,
    label: "ГАРГОНА",
    isBoss: true,
    behavior: "chase"
  }
};

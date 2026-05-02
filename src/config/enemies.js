export const ENEMY_TYPES = {
  basic: {
    key: "skeleton",
    hp: 60, damage: 10, speed: 65, xp: 10,
    scale: 1.0, tint: 0xffffff,
    label: "Скелет"
  },
  fast: {
    key: "skeleton",
    hp: 35, damage: 8, speed: 130, xp: 15,
    scale: 0.75, tint: 0xffbb44,
    label: "Быстрый скелет"
  },
  tank: {
    key: "cultist",
    hp: 180, damage: 18, speed: 38, xp: 25,
    scale: 1.35, tint: 0xffffff,
    label: "Культист-страж"
  },
  shooter: {
    key: "cultist",
    hp: 45, damage: 12, speed: 45, xp: 20,
    scale: 0.9, tint: 0xaaddff,
    label: "Культист-маг",
    ranged: true, shootCooldown: 2000, bulletSpeed: 200
  },
  boss: {
    key: "gargonaBoss",
    hp: 500, damage: 25, speed: 55, xp: 100,
    scale: 2.0, tint: 0xffffff,
    label: "ГАРГОНА",
    isBoss: true
  }
};

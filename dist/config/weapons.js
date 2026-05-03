export const WEAPONS = {
  brokenbow:   { key: "BrokenArrow", iconKey: "Brokenbow",        speed: 200, damage: 13, cooldown: 600, scale: 1.0,  tint: 0xffffff, rotationOffset: Math.PI / 2, range: 260 },
  arrow:       { key: "arrow",                                     speed: 320, damage: 10, cooldown: 380, scale: 1.05, tint: 0xffffff, range: 300 },
  fire:        { key: "fire",                                      speed: 340, damage: 32, cooldown: 520, scale: 1.15, tint: 0xff5500, range: 320 },
  ice:         { key: "ice",                                       speed: 280, damage: 28, cooldown: 480, scale: 1.12, tint: 0x88ddff, range: 280 },
  plasma:      { key: "plasma",                                    speed: 520, damage: 45, cooldown: 650, scale: 1.25, tint: 0xcc44ff, range: 380 },
  earth:       { key: "earth",                                     speed: 220, damage: 55, cooldown:1100, scale: 1.45, tint: 0x88aa44, range: 230 },
  bullet:      { key: "bullet",                                    speed: 750, damage: 16, cooldown: 110, scale: 0.75, tint: 0xffee44, range: 380 },

  // ── Melee ─────────────────────────────────────────────────────────────────
  sword:       { key: "sword",    iconKey: "swordWarrior",         speed: 650, damage: 38, cooldown: 280, scale: 1.1,  tint: 0xffffff, range: 90 },
  dagger:      { key: "sword",    iconKey: "weaponDagger",         speed: 720, damage: 22, cooldown: 145, scale: 0.85, tint: 0xaaaaff, range: 55 },
  paladinSword:{ key: "sword",    iconKey: "weaponPaladinSword",   speed: 580, damage: 45, cooldown: 340, scale: 1.1,  tint: 0xffeebb, range: 85 },

  // ── Magic ranged ──────────────────────────────────────────────────────────
  magicStaff:  { key: "fire",     iconKey: "weaponMagicStaff",     speed: 360, damage: 35, cooldown: 500, scale: 1.15, tint: 0xff6600, range: 320 },
  necroStaff:  { key: "plasma",   iconKey: "weaponNecroStaff",     speed: 300, damage: 40, cooldown: 560, scale: 1.1,  tint: 0xaa44ff, range: 300 },
};

export const WEAPON_LIST = [
  "brokenbow", "magicStaff", "necroStaff",
  "sword", "dagger", "paladinSword",
  "fire", "ice", "plasma", "earth", "bullet",
];

export const WEAPON_LABELS = [
  "Лук", "Магический посох", "Посох некроманта",
  "Меч", "Кинжал", "Меч паладина",
  "Огонь", "Лёд", "Плазма", "Земля", "Пуля",
];
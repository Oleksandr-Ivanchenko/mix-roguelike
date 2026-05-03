export const WEAPONS = {
  brokenbow:   { key: "BrokenArrow", iconKey: "Brokenbow",        speed: 175, damage: 12, cooldown: 650, scale: 1.0,  tint: 0xffffff, rotationOffset: Math.PI / 2, range: 240 },
  arrow:       { key: "arrow",                                     speed: 280, damage: 9,  cooldown: 420, scale: 1.05, tint: 0xffffff, range: 280 },
  fire:        { key: "fire",                                      speed: 290, damage: 28, cooldown: 580, scale: 1.15, tint: 0xff5500, range: 300 },
  ice:         { key: "ice",                                       speed: 240, damage: 24, cooldown: 530, scale: 1.12, tint: 0x88ddff, range: 260 },
  plasma:      { key: "plasma",                                    speed: 420, damage: 40, cooldown: 720, scale: 1.25, tint: 0xcc44ff, range: 360 },
  earth:       { key: "earth",                                     speed: 185, damage: 48, cooldown:1200, scale: 1.45, tint: 0x88aa44, range: 215 },
  bullet:      { key: "bullet",                                    speed: 600, damage: 14, cooldown: 130, scale: 0.75, tint: 0xffee44, range: 360 },

  // ── Melee ─────────────────────────────────────────────────────────────────
  // phases: { windup, swing, recovery } ms — sum ≈ cooldown
  // arcHalf: half-angle of hit cone (rad). luneSpeed: lunge px/s. knockback: impact force.
  sword:       { key: "sword",    iconKey: "swordWarrior",         speed: 580, damage: 32, cooldown: 320, scale: 1.1,  tint: 0xffffff, range: 85,
                 phases: { windup: 75,  swing: 75,  recovery: 120, arcHalf: Math.PI / 3,    luneSpeed: 160, knockback: 250 } },
  dagger:      { key: "sword",    iconKey: "weaponDagger",         speed: 640, damage: 18, cooldown: 170, scale: 0.85, tint: 0xaaaaff, range: 52,
                 phases: { windup: 30,  swing: 50,  recovery: 70,  arcHalf: Math.PI / 6,    luneSpeed: 240, knockback: 160 } },
  paladinSword:{ key: "sword",    iconKey: "weaponPaladinSword",   speed: 520, damage: 38, cooldown: 380, scale: 1.1,  tint: 0xffeebb, range: 82,
                 phases: { windup: 110, swing: 90,  recovery: 150, arcHalf: Math.PI * 0.42, luneSpeed: 125, knockback: 340 } },

  // ── Magic ranged ──────────────────────────────────────────────────────────
  magicStaff:  { key: "fire",     iconKey: "weaponMagicStaff",     speed: 300, damage: 30, cooldown: 560, scale: 1.15, tint: 0xff6600, range: 300 },
  necroStaff:  { key: "plasma",   iconKey: "weaponNecroStaff",     speed: 255, damage: 34, cooldown: 620, scale: 1.1,  tint: 0xaa44ff, range: 280 },
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
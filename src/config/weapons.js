export const WEAPONS = {
  brokenbow: { key: "BrokenArrow", iconKey: "Brokenbow", speed: 200, damage: 13, cooldown: 600, scale: 1.0, tint: 0xffffff, rotationOffset: Math.PI / 2, range: 260 },
  arrow:     { key: "arrow",    speed: 320, damage: 10,  cooldown: 380,  scale: 1.05, tint: 0xffffff, range: 300 },
  fire:      { key: "fire",     speed: 340, damage: 32,  cooldown: 520,  scale: 1.15, tint: 0xff5500, range: 320 },
  ice:       { key: "ice",      speed: 280, damage: 28,  cooldown: 480,  scale: 1.12, tint: 0x88ddff, range: 280 },
  plasma:    { key: "plasma",   speed: 520, damage: 45,  cooldown: 650,  scale: 1.25, tint: 0xcc44ff, range: 380 },
  earth:     { key: "earth",    speed: 220, damage: 55,  cooldown: 1100, scale: 1.45, tint: 0x88aa44, range: 230 },

  sword:     { key: "sword",    iconKey: "swordWarrior", speed: 650, damage: 38, cooldown: 280,  scale: 1.1,  tint: 0xffffff, range: 90 },
  axe:       { key: "axe",      speed: 580, damage: 48,  cooldown: 420,  scale: 1.3,  tint: 0xffaa33, range: 90 },
  hammer:    { key: "hammer",   speed: 420, damage: 65,  cooldown: 680,  scale: 1.55, tint: 0xcccccc, range: 90 },

  dagger:    { key: "dagger",   speed: 720, damage: 22,  cooldown: 160,  scale: 0.85, tint: 0xaaaaaa, range: 90 },
  spear:     { key: "spear",    speed: 480, damage: 35,  cooldown: 340,  scale: 1.2,  tint: 0x88ffaa, range: 110 },

  bullet:    { key: "bullet",   speed: 750, damage: 16,  cooldown: 110,  scale: 0.75, tint: 0xffee44, range: 380 },
  shotgun:   { key: "shotgun",  speed: 680, damage: 12,  cooldown: 520,  scale: 1.1,  tint: 0xff8800, range: 260 },

  lightning: { key: "lightning",speed: 620, damage: 40,  cooldown: 450,  scale: 1.0,  tint: 0x88ffff, range: 340 },
  poison:    { key: "poison",   speed: 300, damage: 25,  cooldown: 380,  scale: 1.1,  tint: 0x55ff77, range: 260 },
  holy:      { key: "holy",     speed: 450, damage: 42,  cooldown: 520,  scale: 1.2,  tint: 0xffeebb, range: 300 },
  shadow:    { key: "shadow",   speed: 510, damage: 38,  cooldown: 400,  scale: 1.05, tint: 0x9955ff, range: 320 },

  staff:     { key: "staff",    speed: 380, damage: 50,  cooldown: 580,  scale: 1.35, tint: 0x9966ff, range: 280 },
  wand:      { key: "wand",     speed: 420, damage: 27,  cooldown: 320,  scale: 0.9,  tint: 0xff99ff, range: 300 },
};

export const WEAPON_LIST = [
  "brokenbow", "fire", "ice", "plasma", "earth",
  "sword", "axe", "hammer", "dagger", "spear",
  "bullet", "shotgun", 
  "lightning", "poison", "holy", "shadow",
  "staff", "wand"
];

export const WEAPON_LABELS = [
  "Сл.Лук", "Огонь", "Лёд", "Плазма", "Земля",
  "Меч", "Топор", "Молот", "Кинжал", "Копьё",
  "Автомат", "Дробовик",
  "Молния", "Яд", "Святость", "Тень",
  "Посох", "Волшебная палочка"
];
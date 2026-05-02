export const RARITY = {
  common:    { label: "ОБЫЧНЫЙ",     color: "#66aa66", border: 0x335533, bg: 0x0e1a0e, weight: 60 },
  rare:      { label: "РЕДКИЙ",      color: "#4488ff", border: 0x224499, bg: 0x080e1e, weight: 25 },
  epic:      { label: "ЭПИЧЕСКИЙ",   color: "#cc44ff", border: 0x771199, bg: 0x10061a, weight: 12 },
  legendary: { label: "ЛЕГЕНДАРНЫЙ", color: "#ffaa00", border: 0x995500, bg: 0x1e0e00, weight: 3  },
};

// class: "warrior" | "archer" | "both" (undefined = both)
export const SKILL_POOL = [
  // ═══ COMMON — оба класса ═══════════════════════════════════════════════════
  { id: "dmg_up",       rarity: "common",  icon: "⚔️",  label: "+20% урон",              apply: s => { s.damageMult += 0.20; } },
  { id: "dmg_up2",      rarity: "common",  icon: "⚔️",  label: "+25% урон",              apply: s => { s.damageMult += 0.25; } },
  { id: "atk_speed",    rarity: "common",  icon: "⚡",  label: "+20% скорость атаки",    apply: s => { s.cooldownMult *= 0.80; } },
  { id: "atk_speed2",   rarity: "common",  icon: "⚡",  label: "+25% скорость атаки",    apply: s => { s.cooldownMult *= 0.75; } },
  { id: "move_speed",   rarity: "common",  icon: "👟",  label: "+15% скорость движения", apply: s => { s.moveSpeed += 27; } },
  { id: "move_speed2",  rarity: "common",  icon: "👟",  label: "+20% скорость движения", apply: s => { s.moveSpeed += 36; } },
  { id: "max_hp",       rarity: "common",  icon: "❤️",  label: "+30 макс HP",            apply: s => { s.playerMaxHP += 30; s.playerHP = Math.min(s.playerHP + 30, s.playerMaxHP); s.hud.refreshHP(s.playerHP, s.playerMaxHP); } },
  { id: "max_hp2",      rarity: "common",  icon: "❤️",  label: "+45 макс HP",            apply: s => { s.playerMaxHP += 45; s.playerHP = Math.min(s.playerHP + 45, s.playerMaxHP); s.hud.refreshHP(s.playerHP, s.playerMaxHP); } },
  { id: "regen",        rarity: "common",  icon: "🌿",  label: "+1.5 HP/сек",            apply: s => { s.hpRegen += 1.5; } },
  { id: "xp_boost",     rarity: "common",  icon: "⭐",  label: "+30% опыта",             apply: s => { s.xpMult += 0.30; } },

  // ═══ COMMON — только воин ═══════════════════════════════════════════════════
  { id: "war_stamina",  rarity: "common",  class: "warrior", icon: "💪", label: "+25 выносливости",         apply: s => { s.maxStamina += 25; s.stamina = Math.min(s.stamina + 25, s.maxStamina); } },
  { id: "war_armor_l",  rarity: "common",  class: "warrior", icon: "🛡️", label: "+15 брони",                apply: s => { s.armor += 15; } },

  // ═══ COMMON — только лучник ════════════════════════════════════════════════
  { id: "arc_range",    rarity: "common",  class: "archer",  icon: "🏹", label: "+25% дальность стрельбы",  apply: s => { s.rangeBonus = (s.rangeBonus || 1) + 0.25; } },
  { id: "arc_mana_l",   rarity: "common",  class: "archer",  icon: "💧", label: "+20 маны",                 apply: s => { s.maxMana += 20; s.mana = Math.min(s.mana + 20, s.maxMana); } },

  // ═══ RARE — оба класса ═════════════════════════════════════════════════════
  { id: "lifesteal",    rarity: "rare",    icon: "🩸",  label: "Вампиризм +5 HP/удар",   apply: s => { s.lifesteal += 5; } },
  { id: "lifesteal2",   rarity: "rare",    icon: "🩸",  label: "Вампиризм +10 HP/удар",  apply: s => { s.lifesteal += 10; } },
  { id: "crit_chance",  rarity: "rare",    icon: "🎯",  label: "+10% шанс крита",        apply: s => { s.critChance += 0.10; } },
  { id: "crit_mult",    rarity: "rare",    icon: "💥",  label: "+40% крит. урон",        apply: s => { s.critMult += 0.40; } },
  { id: "gold_boost",   rarity: "rare",    icon: "💰",  label: "+35% золота",            apply: s => { s.goldMult = (s.goldMult || 1) + 0.35; } },
  { id: "dodge_up",     rarity: "rare",    icon: "🌫️",  label: "+12% уклонение",         apply: s => { s.dodgeChance += 0.12; } },

  // ═══ RARE — только воин ════════════════════════════════════════════════════
  { id: "armor",        rarity: "rare",    class: "warrior", icon: "🛡️",  label: "+20 брони",               apply: s => { s.armor += 20; } },
  { id: "knockback",    rarity: "rare",    class: "warrior", icon: "🌬️",  label: "Отбрасывание врагов",     apply: s => { s.knockback = true; } },
  { id: "war_thorns_r", rarity: "rare",    class: "warrior", icon: "🌵",  label: "Шипы — отражение 8 урона",apply: s => { s.thorns = (s.thorns || 0) + 8; } },

  // ═══ RARE — только лучник ══════════════════════════════════════════════════
  { id: "multishot",    rarity: "rare",    class: "archer",  icon: "🏹",  label: "Мультивыстрел +1 стрела", apply: s => { s.multishot += 1; } },
  { id: "multishot2",   rarity: "rare",    class: "archer",  icon: "🏹",  label: "Мультивыстрел +2 стрелы", apply: s => { s.multishot += 2; } },
  { id: "proj_speed",   rarity: "rare",    class: "archer",  icon: "🚀",  label: "+40% скорость снарядов",  apply: s => { s.projectileSpeedMult = (s.projectileSpeedMult || 1) + 0.40; } },

  // ═══ EPIC — только воин ════════════════════════════════════════════════════
  { id: "whirlwind",    rarity: "epic", class: "warrior", unique: true, icon: "🌀", label: "Вихрь — AoE атака",       apply: s => {
    s.whirlwind = true;
    s.time.addEvent({ delay: 3000, loop: true, callback: () => {
      if (!s.whirlwind || !s.player?.active) return;
      const r = 100;
      s.effectsSystem?.whirlwind?.(s.player.x, s.player.y, r);
      const dist2d = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
      s.enemies?.getChildren().forEach(e => {
        if (!e.active) return;
        if (dist2d(e.x, e.y, s.player.x, s.player.y) < r) {
          e.hp -= Math.floor(35 * s.damageMult);
          if (e.hp <= 0) s.combat?.killEnemy(e);
        }
      });
    }});
  } },
  { id: "berserk",      rarity: "epic", class: "warrior", unique: true, icon: "😡", label: "Берсерк +40% урон",       apply: s => { s.berserkMode = true; s.damageMult += 0.40; } },
  { id: "thorns",       rarity: "epic", class: "warrior",               icon: "🌵", label: "Шипы — отражение урона",  apply: s => { s.thorns = (s.thorns || 0) + 10; } },
  { id: "burn_chance",  rarity: "epic", class: "warrior",               icon: "🔥", label: "25% шанс поджога",        apply: s => { s.burnChance = (s.burnChance || 0) + 0.25; } },

  // ═══ EPIC — только лучник ══════════════════════════════════════════════════
  { id: "pierce",           rarity: "epic", class: "archer", unique: true, icon: "🔱", label: "Пробивание врагов",      apply: s => { s.pierce = true; } },
  { id: "explosive_arrow",  rarity: "epic", class: "archer", unique: true, icon: "💣", label: "Взрывные стрелы",        apply: s => { s.explosiveArrows = true; } },
  { id: "freeze_chance",    rarity: "epic", class: "archer",               icon: "❄️", label: "20% шанс заморозки",     apply: s => { s.freezeChance = (s.freezeChance || 0) + 0.20; } },
  { id: "chain_lightning",  rarity: "epic", class: "archer", unique: true, icon: "⚡", label: "Цепная молния",          apply: s => { s.chainLightning = true; } },

  // ═══ EPIC — оба класса ═════════════════════════════════════════════════════
  { id: "aoe_death",    rarity: "epic", unique: true, icon: "💀", label: "Взрыв при смерти врага", apply: s => { s.aoeOnDeath = true; } },

  // ═══ LEGENDARY — оба класса ════════════════════════════════════════════════
  { id: "vampire_aura",  rarity: "legendary", unique: true, icon: "🧛", label: "Аура вампира — HP за убийство", apply: s => { s.vampireAura = true; } },
  { id: "meteor",        rarity: "legendary", unique: true, icon: "☄️", label: "Метеор каждые 8 секунд",        apply: s => {
    s.meteorAbility = true;
    s.time.addEvent({ delay: 8000, loop: true, callback: () => {
      if (!s.meteorAbility || !s.player?.active) return;
      const targets = s.enemies?.getChildren().filter(e => e.active);
      if (!targets?.length) return;
      const target = targets[Math.floor(Math.random() * targets.length)];
      s.effectsSystem?.meteor?.(target.x, target.y);
      s.time.delayedCall(400, () => {
        if (!s.enemies) return;
        const dist2d = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
        s.enemies.getChildren().forEach(e => {
          if (!e.active) return;
          if (dist2d(e.x, e.y, target.x, target.y) < 80) {
            e.hp -= Math.floor(150 * s.damageMult);
            if (e.hp <= 0) s.combat?.killEnemy(e);
          }
        });
      });
    }});
  } },
  { id: "time_warp",     rarity: "legendary", unique: true, icon: "⏳", label: "Замедление времени 30%",         apply: s => { s.timeWarp = true; } },
  { id: "divine_shield", rarity: "legendary", unique: true, icon: "✨", label: "Божественный щит 5 сек/мин",    apply: s => {
    s.divineShield = true;
    const activate = () => {
      if (!s.divineShield) return;
      s.shieldActive = true;
      s.player?.setTint(0xffeebb);
      s.time.delayedCall(5000, () => {
        s.shieldActive = false;
        if (s.player?.active) s.player.clearTint();
        s.time.delayedCall(55000, activate);
      });
    };
    activate();
  } },
  { id: "crit_storm",    rarity: "legendary", unique: true, icon: "⚡", label: "Критический шторм — +60% крит", apply: s => { s.critChance += 0.30; s.critMult += 0.60; } },
];

// ═══ СИНЕРГИИ ══════════════════════════════════════════════════════════════════
export const SYNERGIES = [
  // ── Лучник ────────────────────────────────────────────────────────────────
  {
    id: "rain_of_arrows", requires: ["multishot", "pierce"],
    label: "🌧️ Дождь стрел", desc: "+1 стрела, все пробивают насквозь",
    apply: s => { s.multishot += 1; s.pierce = true; },
  },
  {
    id: "explosive_volley", requires: ["multishot", "explosive_arrow"],
    label: "💣 Взрывной залп", desc: "Каждая доп. стрела взрывается",
    apply: s => { s.explosionOnMultishot = true; },
  },
  {
    id: "death_arsenal", requires: ["multishot", "pierce", "explosive_arrow"],
    label: "☠️ Арсенал смерти", desc: "+3 стрелы, двойной радиус взрыва",
    apply: s => { s.multishot += 3; s.explosionRadius = (s.explosionRadius || 50) * 2; },
  },
  {
    id: "elemental_chaos", requires: ["freeze_chance", "chain_lightning"],
    label: "🌪️ Хаос стихий", desc: "+15% шанс оглушения при попадании",
    apply: s => { s.stunChance = (s.stunChance || 0) + 0.15; },
  },

  // ── Воин ──────────────────────────────────────────────────────────────────
  {
    id: "bloodlust", requires: ["berserk", "lifesteal"],
    label: "🩸 Кровожажда", desc: "Вампиризм удвоен во время берсерка",
    apply: s => { s.bloodlust = true; },
  },
  {
    id: "glass_cannon", requires: ["crit_chance", "crit_mult", "berserk"],
    label: "💥 Стеклянная пушка", desc: "×2 крит урон, −20% макс HP",
    apply: s => { s.critMult *= 2; s.playerMaxHP = Math.max(20, s.playerMaxHP - Math.floor(s.playerMaxHP * 0.20)); },
  },
  {
    id: "iron_fortress", requires: ["armor", "thorns", "war_stamina"],
    label: "🏰 Железная крепость", desc: "+30 брони, шипы ×2",
    apply: s => { s.armor += 30; s.thorns = (s.thorns || 0) * 2 + 5; },
  },

  // ── Оба класса ─────────────────────────────────────────────────────────────
  {
    id: "undying", requires: ["max_hp", "lifesteal", "regen"],
    label: "⚔️ Неумирающий", desc: "+50 HP, реген × 2",
    apply: s => { s.playerMaxHP += 50; s.playerHP = Math.min(s.playerHP + 50, s.playerMaxHP); s.hpRegen *= 2; },
  },
];

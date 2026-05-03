import Phaser from "phaser";

// Map icon filename → Phaser texture key (loaded in GameScene.preload)
const ICON = {
  "iron_guard.png":     "skill_IronGuard",
  "steel_bastion.png":  "skill_SteelBarrier",
  "chain_dash.png":     "skill_BladeDash",
  "lightning_step.png": "skill_SwiftSlash",
  "midas_strike.png":   "skill_MidasBlow",
  "royal_blow.png":     "skill_RoyalStrike",
  "shockwave_ring.png": "skill_ShockwaveSlam",
  "gravity_crush.png":  "skill_GravityCrush",
  "arcane_slash.png":   "skill_ArcaneBlade",
  "spirit_chain.png":   "skill_SpiritSlash",
  "void_burst.png":     "skill_VoidExecution",
  "oblivion_strike.png":"skill_OblivionStrike",
};

export const CRAFTED_SKILLS = [
  // ═══ IRON — защита / стабильность ══════════════════════════════════════════
  {
    id: "iron_guard", name: "Iron Guard", icon: ICON["iron_guard.png"],
    class: "warrior", rarity: "common",
    ingredients: ["IronOre"],
    result: { type: "skill", effect: "shield", value: 20, duration: 5 },
    resource: "stamina", cost: 30, cooldown: 8000,
    desc: "Щит 5 сек: −40% урона",
    apply(s) {
      s.armor += 40;
      s.player?.setTint(0x4488ff);
      const ring = s.add.circle(s.player.x, s.player.y, 30, 0x4488ff, 0.35).setDepth(9);
      s.tweens.add({ targets: ring, alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 400, onComplete: () => ring.destroy() });
      s.time.delayedCall(5000, () => { s.armor = Math.max(0, s.armor - 40); s.player?.active && s.player.clearTint(); });
    },
  },
  {
    id: "steel_bastion", name: "Steel Bastion", icon: ICON["steel_bastion.png"],
    class: "archer", rarity: "rare",
    ingredients: ["IronOre", "IronOre", "CopperOre"],
    result: { type: "skill", effect: "shield_aura", value: 10, radius: 120, duration: 6 },
    resource: "stamina", cost: 25, cooldown: 9000,
    desc: "Отбросить всех врагов в радиусе 120",
    apply(s) {
      const boom = s.add.circle(s.player.x, s.player.y, 10, 0x4488ff, 0.4).setDepth(9);
      s.tweens.add({ targets: boom, radius: 120, alpha: 0, duration: 350, onComplete: () => boom.destroy() });
      s.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        const d = Phaser.Math.Distance.Between(e.x, e.y, s.player.x, s.player.y);
        if (d < 120) {
          const a = Phaser.Math.Angle.Between(s.player.x, s.player.y, e.x, e.y);
          e.body.setVelocity(Math.cos(a) * 360, Math.sin(a) * 360);
          e.hp -= 10;
          if (e.hp <= 0) s.combat.killEnemy(e);
        }
      });
    },
  },

  // ═══ COPPER — скорость / цепи ═══════════════════════════════════════════════
  {
    id: "chain_dash", name: "Chain Dash", icon: ICON["chain_dash.png"],
    class: "warrior", rarity: "common",
    ingredients: ["CopperOre"],
    result: { type: "skill", effect: "dash", value: 1.5, cooldown: 3 },
    resource: "stamina", cost: 40, cooldown: 5000,
    desc: "Рывок к врагу, урон на пути",
    apply(s) {
      const target = s.enemies.getChildren().filter(e => e.active)
        .sort((a, b) => Phaser.Math.Distance.Between(a.x, a.y, s.player.x, s.player.y) - Phaser.Math.Distance.Between(b.x, b.y, s.player.x, s.player.y))[0];
      const angle = target ? Phaser.Math.Angle.Between(s.player.x, s.player.y, target.x, target.y) : 0;
      s.isDashing = true;
      s.player?.setTint(0xff8800);
      s.player?.body.setVelocity(Math.cos(angle) * 660, Math.sin(angle) * 660);
      s.time.addEvent({
        delay: 20, repeat: 8, callback: () => {
          if (!s.player?.active) return;
          s.enemies.getChildren().forEach(e => {
            if (!e.active) return;
            if (Phaser.Math.Distance.Between(e.x, e.y, s.player.x, s.player.y) < 38) {
              e.hp -= Math.floor(30 * s.damageMult);
              if (e.hp <= 0) s.combat.killEnemy(e);
            }
          });
        }
      });
      s.time.delayedCall(165, () => {
        s.isDashing = false;
        if (s.player?.active) { s.player.body.setVelocity(0, 0); s.player.clearTint(); }
      });
    },
  },
  {
    id: "lightning_step", name: "Lightning Step", icon: ICON["lightning_step.png"],
    class: "archer", rarity: "rare",
    ingredients: ["CopperOre", "GoldOre"],
    result: { type: "skill", effect: "teleport_attack", damage: 25, chain: 2 },
    resource: "stamina", cost: 35, cooldown: 6000,
    desc: "+4 быстрых стрелы по ближайшему",
    apply(s) {
      const target = s.enemies.getChildren().filter(e => e.active)
        .sort((a, b) => Phaser.Math.Distance.Between(a.x, a.y, s.player.x, s.player.y) - Phaser.Math.Distance.Between(b.x, b.y, s.player.x, s.player.y))[0];
      if (!target) return;
      for (let i = 0; i < 4; i++) {
        s.time.delayedCall(i * 65, () => {
          if (!target.active || !s.player?.active) return;
          const proj = s.add.image(s.player.x, s.player.y, "BrokenArrow").setDisplaySize(14, 14).setDepth(4).setTint(0xffaa00);
          s.physics.add.existing(proj);
          proj.body.setAllowGravity(false);
          const a = Phaser.Math.Angle.Between(s.player.x, s.player.y, target.x, target.y);
          proj.rotation = a + Math.PI / 2;
          proj.body.setVelocity(Math.cos(a) * 400, Math.sin(a) * 400);
          proj.dmg = Math.floor(25 * s.damageMult);
          s.projectiles.add(proj);
          s.time.delayedCall(1500, () => { if (proj.active) proj.destroy(); });
        });
      }
    },
  },

  // ═══ GOLD — крит / усиление ═════════════════════════════════════════════════
  {
    id: "midas_strike", name: "Midas Strike", icon: ICON["midas_strike.png"],
    class: "archer", rarity: "rare",
    ingredients: ["GoldOre"],
    result: { type: "skill", effect: "crit_boost", critChance: 25, duration: 6 },
    resource: "mana", cost: 35, cooldown: 7000,
    desc: "+25% крит на 6 сек",
    apply(s) {
      s.critChance += 0.25;
      s.player?.setTint(0xffdd00);
      s.time.delayedCall(6000, () => { s.critChance -= 0.25; s.player?.active && s.player.clearTint(); });
    },
  },
  {
    id: "royal_blow", name: "Royal Blow", icon: ICON["royal_blow.png"],
    class: "warrior", rarity: "epic",
    ingredients: ["GoldOre", "IronOre"],
    result: { type: "skill", effect: "heavy_crit", damageMultiplier: 3, knockback: true },
    resource: "mana", cost: 45, cooldown: 8000,
    desc: "×3 урон + отброс в радиусе рукопашной",
    apply(s) {
      const range = (s.playerClass?.meleeRange ?? 72) + 22;
      s.player?.setTint(0xffaa00);
      s.time.delayedCall(200, () => { s.player?.active && s.player.clearTint(); });
      s.cameras.main.shake(120, 0.010);
      s.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        const d = Phaser.Math.Distance.Between(e.x, e.y, s.player.x, s.player.y);
        if (d < range) {
          e.hp -= Math.floor(60 * s.damageMult);
          const a = Phaser.Math.Angle.Between(s.player.x, s.player.y, e.x, e.y);
          e.body.setVelocity(Math.cos(a) * 500, Math.sin(a) * 500);
          if (e.hp <= 0) s.combat.killEnemy(e);
        }
      });
    },
  },

  // ═══ PLATINUM — AoE / контроль ══════════════════════════════════════════════
  {
    id: "shockwave_ring", name: "Shockwave Ring", icon: ICON["shockwave_ring.png"],
    class: "archer", rarity: "rare",
    ingredients: ["PlatinumOre"],
    result: { type: "skill", effect: "aoe_push", radius: 150, damage: 20 },
    resource: "mana", cost: 40, cooldown: 8000,
    desc: "Кольцо ударной волны: урон + отброс 150px",
    apply(s) {
      const ring = s.add.circle(s.player.x, s.player.y, 10, 0x66ffcc, 0.55).setDepth(9);
      s.tweens.add({ targets: ring, radius: 150, alpha: 0, duration: 380, onComplete: () => ring.destroy() });
      s.cameras.main.shake(120, 0.008);
      s.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        const d = Phaser.Math.Distance.Between(e.x, e.y, s.player.x, s.player.y);
        if (d < 150) {
          const a = Phaser.Math.Angle.Between(s.player.x, s.player.y, e.x, e.y);
          e.body.setVelocity(Math.cos(a) * 380, Math.sin(a) * 380);
          e.hp -= Math.floor(20 * s.damageMult);
          if (e.hp <= 0) s.combat.killEnemy(e);
        }
      });
    },
  },
  {
    id: "gravity_crush", name: "Gravity Crush", icon: ICON["gravity_crush.png"],
    class: "warrior", rarity: "epic",
    ingredients: ["PlatinumOre", "CopperOre"],
    result: { type: "skill", effect: "pull_and_stun", radius: 180, duration: 2 },
    resource: "mana", cost: 55, cooldown: 10000,
    desc: "AoE: урон 150px + замедление 3 сек",
    apply(s) {
      const boom = s.add.circle(s.player.x, s.player.y, 20, 0xaaddff, 0.5).setDepth(9);
      s.tweens.add({ targets: boom, radius: 150, alpha: 0, duration: 380, onComplete: () => boom.destroy() });
      s.cameras.main.shake(200, 0.014);
      s.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        if (Phaser.Math.Distance.Between(e.x, e.y, s.player.x, s.player.y) < 150) {
          e.hp -= Math.floor(50 * s.damageMult);
          const orig = e.etype.speed;
          e.etype.speed = orig * 0.2;
          s.time.delayedCall(3000, () => { if (e.active) e.etype.speed = orig; });
          if (e.hp <= 0) s.combat.killEnemy(e);
        }
      });
    },
  },

  // ═══ MYTHRIL — магия / гибрид ════════════════════════════════════════════════
  {
    id: "arcane_slash", name: "Arcane Slash", icon: ICON["arcane_slash.png"],
    class: "warrior", rarity: "rare",
    ingredients: ["MythrilOre"],
    result: { type: "skill", effect: "magic_melee", damage: 35, pierce: true },
    resource: "mana", cost: 45, cooldown: 7000,
    desc: "Аура 4 сек: цепная молния при каждом ударе",
    apply(s) {
      s.chainLightning = true;
      s.player?.setTint(0x44ffcc);
      s.time.delayedCall(4000, () => { s.chainLightning = false; s.player?.active && s.player.clearTint(); });
    },
  },
  {
    id: "spirit_chain", name: "Spirit Chain", icon: ICON["spirit_chain.png"],
    class: "archer", rarity: "epic",
    ingredients: ["MythrilOre", "GoldOre"],
    result: { type: "skill", effect: "chain_magic", targets: 4, damage: 20 },
    resource: "mana", cost: 50, cooldown: 9000,
    desc: "Самонаводящийся магический снаряд-дух",
    apply(s) {
      const aliveEnemies = s.enemies.getChildren().filter(e => e.active);
      if (!aliveEnemies.length) return;
      let target = aliveEnemies.sort((a, b) => b.hp - a.hp)[0];
      const proj = s.add.image(s.player.x, s.player.y, "BrokenArrow")
        .setDisplaySize(18, 18).setDepth(4).setTint(0x44ffcc);
      s.physics.add.existing(proj);
      proj.body.setAllowGravity(false);
      proj.dmg = Math.floor(60 * s.damageMult);
      s.projectiles.add(proj);
      s.time.addEvent({
        delay: 30, repeat: 45, callback: () => {
          if (!proj.active) return;
          if (!target?.active) target = s.enemies.getChildren().filter(e => e.active)[0];
          if (!target) return;
          const a = Phaser.Math.Angle.Between(proj.x, proj.y, target.x, target.y);
          proj.rotation = a + Math.PI / 2;
          proj.body.setVelocity(Math.cos(a) * 280, Math.sin(a) * 280);
        }
      });
      s.time.delayedCall(1500, () => { if (proj.active) proj.destroy(); });
    },
  },

  // ═══ OBSIDIAN — хаос / ульта ════════════════════════════════════════════════
  {
    id: "void_burst", name: "Void Burst", icon: ICON["void_burst.png"],
    class: "warrior", rarity: "legendary",
    ingredients: ["ObsidianChunk"],
    result: { type: "skill", effect: "massive_aoe", radius: 250, damage: 80 },
    resource: "mana", cost: 80, cooldown: 20000,
    desc: "УЛЬТА: взрыв 200px, колоссальный урон",
    apply(s) {
      const dmg = Math.floor(150 * s.damageMult);
      s.cameras.main.shake(400, 0.025);
      s.cameras.main.flash(200, 102, 0, 255);
      const boom = s.add.circle(s.player.x, s.player.y, 10, 0x6600ff, 0.7).setDepth(9);
      s.tweens.add({ targets: boom, radius: 200, alpha: 0, duration: 500, onComplete: () => boom.destroy() });
      s.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        if (Phaser.Math.Distance.Between(e.x, e.y, s.player.x, s.player.y) < 200) {
          e.hp -= dmg;
          if (e.hp <= 0) s.combat.killEnemy(e);
        }
      });
    },
  },
  {
    id: "oblivion_strike", name: "Oblivion Strike", icon: ICON["oblivion_strike.png"],
    class: "archer", rarity: "legendary",
    ingredients: ["ObsidianChunk", "MythrilOre"],
    result: { type: "skill", effect: "execute", executeThreshold: 20, damageMultiplier: 5 },
    resource: "mana", cost: 70, cooldown: 15000,
    desc: "УЛЬТА: мгновенно казнить врагов < 40% HP",
    apply(s) {
      s.cameras.main.flash(120, 102, 0, 204);
      let killed = 0;
      s.enemies.getChildren().forEach(e => {
        if (!e.active) return;
        if (e.hp / e.maxHp < 0.40) { s.combat.killEnemy(e); killed++; }
      });
      if (!killed) {
        const nearest = s.enemies.getChildren().filter(e => e.active)
          .sort((a, b) => Phaser.Math.Distance.Between(a.x, a.y, s.player.x, s.player.y) - Phaser.Math.Distance.Between(b.x, b.y, s.player.x, s.player.y))[0];
        if (nearest) { nearest.hp -= Math.floor(120 * s.damageMult); if (nearest.hp <= 0) s.combat.killEnemy(nearest); }
      }
    },
  },
];

// Derive recipe map from ingredients array
CRAFTED_SKILLS.forEach(sk => {
  sk.recipe = sk.ingredients.reduce((acc, k) => { acc[k] = (acc[k] || 0) + 1; return acc; }, {});
});

export const SKILL_ASSET_MAP = [
  ["skill_IronGuard",    "assets/skills/IRONSKILLS/Iron Guard.png"],
  ["skill_SteelBarrier", "assets/skills/IRONSKILLS/SteelBarrier.png"],
  ["skill_BladeDash",    "assets/skills/COPPERSKILLS/BladeDash.png"],
  ["skill_SwiftSlash",   "assets/skills/COPPERSKILLS/SwiftSlash.png"],
  ["skill_MidasBlow",    "assets/skills/GOLDSKILLS/MidasBlow.png"],
  ["skill_RoyalStrike",  "assets/skills/GOLDSKILLS/RoyalStrike.png"],
  ["skill_ShockwaveSlam","assets/skills/PLATINUMSKILLS/ShockwaveSlam.png"],
  ["skill_GravityCrush", "assets/skills/PLATINUMSKILLS/GravityCrush.png"],
  ["skill_ArcaneBlade",  "assets/skills/MYTHRILSKILLS/ArcaneBlade.png"],
  ["skill_SpiritSlash",  "assets/skills/MYTHRILSKILLS/SpiritSlash.png"],
  ["skill_VoidExecution","assets/skills/OBSIDIANSKILLS/VoidExecution.png"],
  ["skill_OblivionStrike","assets/skills/OBSIDIANSKILLS/OblivionStrike.png"],
];

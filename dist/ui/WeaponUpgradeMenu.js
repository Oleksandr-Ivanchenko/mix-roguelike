import { WEAPON_UPGRADES, CLASS_UPGRADE_TRACK } from "../config/weaponUpgrades.js";

export class WeaponUpgradeMenu {
  constructor(scene) {
    this.scene = scene;
    this._els  = [];
  }

  show() {
    this.hide();
    const s     = this.scene;
    const W     = s.cameras.main.width;
    const H     = s.cameras.main.height;
    const track = WEAPON_UPGRADES[CLASS_UPGRADE_TRACK[s.playerClass?.id] ?? "archer"];
    const tier  = s.weaponTier ?? 0;
    const curr  = track[tier];
    const next  = track[tier + 1];
    const maxed = !next;

    const mk = (el) => { this._els.push(el); return el; };
    const cx = W / 2, cy = H / 2;

    mk(s.add.rectangle(cx, cy, 520, 340, 0x06060f, 0.97)
      .setStrokeStyle(2, 0x3355bb).setScrollFactor(0).setDepth(80));

    mk(s.add.text(cx, cy - 148, "⚔️  ПРОКАЧКА ОРУЖИЯ", {
      fontSize: "20px", color: "#88aaff", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(81));

    // ── Current weapon ──────────────────────────────────────────────────────
    mk(s.add.image(cx - 130, cy - 65, curr.iconKey)
      .setDisplaySize(72, 72).setScrollFactor(0).setDepth(81));
    mk(s.add.text(cx - 130, cy - 18, curr.label, {
      fontSize: "11px", color: "#888888", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(81));
    mk(s.add.text(cx - 130, cy + 2, `Уровень ${tier}`, {
      fontSize: "13px", color: "#cccccc", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(81));

    if (maxed) {
      mk(s.add.text(cx, cy + 20, "✨ МАКСИМАЛЬНЫЙ УРОВЕНЬ ✨", {
        fontSize: "18px", color: "#ffaa00", fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(81));
    } else {
      // Arrow
      mk(s.add.text(cx, cy - 55, "→", {
        fontSize: "40px", color: "#3366ff", fontFamily: "monospace"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(81));

      // ── Next tier ───────────────────────────────────────────────────────
      mk(s.add.image(cx + 130, cy - 65, next.iconKey)
        .setDisplaySize(72, 72).setScrollFactor(0).setDepth(81));
      mk(s.add.text(cx + 130, cy - 18, next.label, {
        fontSize: "11px", color: "#6688cc", fontFamily: "monospace"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(81));
      mk(s.add.text(cx + 130, cy + 2, `Уровень ${tier + 1}`, {
        fontSize: "13px", color: "#aabbff", fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(81));

      // ── Stat deltas ─────────────────────────────────────────────────────
      const prevDmg  = curr.totalDmg  ?? 0;
      const prevCd   = curr.totalCdFact ?? 1;
      const dmgGain  = Math.round((next.totalDmg  - prevDmg) * 100);
      const cdGain   = Math.round((1 - next.totalCdFact / prevCd) * 100);
      mk(s.add.text(cx, cy + 32, `+${dmgGain}% урон   +${cdGain}% скорость атаки`, {
        fontSize: "14px", color: "#55ee88", fontFamily: "monospace"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(81));

      // ── Cost ────────────────────────────────────────────────────────────
      const canAfford = s.gold >= next.cost;
      mk(s.add.text(cx, cy + 60,
        `Цена: ${next.cost} 💰    У вас: ${s.gold} 💰`, {
        fontSize: "14px", color: canAfford ? "#ffdd44" : "#ff5555", fontFamily: "monospace"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(81));

      // ── Upgrade button ──────────────────────────────────────────────────
      const btnFill   = canAfford ? 0x1a3a1a : 0x2a1010;
      const btnBorder = canAfford ? 0x44cc44 : 0x663333;
      const btnBg = mk(s.add.rectangle(cx, cy + 100, 210, 42, btnFill)
        .setStrokeStyle(2, btnBorder).setScrollFactor(0).setDepth(81));
      const btnTxt = mk(s.add.text(cx, cy + 100, "⬆  УЛУЧШИТЬ", {
        fontSize: "16px", color: canAfford ? "#66ff66" : "#774444",
        fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(82));

      if (canAfford) {
        btnBg.setInteractive({ useHandCursor: true });
        btnBg.on("pointerover",  () => { btnBg.setFillStyle(0x2a5a2a); btnTxt.setStyle({ color: "#aaffaa" }); });
        btnBg.on("pointerout",   () => { btnBg.setFillStyle(0x1a3a1a); btnTxt.setStyle({ color: "#66ff66" }); });
        btnBg.on("pointerdown",  () => this._doUpgrade(track, tier, next));
      }
    }

    // ── Close ───────────────────────────────────────────────────────────────
    const clBg = mk(s.add.rectangle(cx, cy + (maxed ? 80 : 152), 210, 36, 0x111122)
      .setStrokeStyle(1, 0x334466).setScrollFactor(0).setDepth(81)
      .setInteractive({ useHandCursor: true }));
    const clTxt = mk(s.add.text(cx, cy + (maxed ? 80 : 152), "Закрыть", {
      fontSize: "14px", color: "#556677", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(82));
    clBg.on("pointerover",  () => { clBg.setFillStyle(0x1a2233); clTxt.setStyle({ color: "#8899aa" }); });
    clBg.on("pointerout",   () => { clBg.setFillStyle(0x111122); clTxt.setStyle({ color: "#556677" }); });
    clBg.on("pointerdown",  () => this.hide());
  }

  _doUpgrade(track, tier, next) {
    const s = this.scene;
    if (s.gold < next.cost) return;

    s.gold -= next.cost;
    s.hud.refreshGold(s.gold);
    s.weaponTier = tier + 1;
    s.registry.set("weaponTier", s.weaponTier);

    // Apply cumulative delta vs previous tier
    const prev = track[tier];
    s.damageMult   += (next.totalDmg  ?? 0) - (prev.totalDmg  ?? 0);
    s.cooldownMult *= ((next.totalCdFact ?? 1) / (prev.totalCdFact ?? 1));

    // Swap weapon sprite texture
    if (s._weaponSprite?.active) s._weaponSprite.setTexture(next.iconKey);

    this.show(); // refresh panel
  }

  hide() {
    this._els.forEach(el => el?.destroy());
    this._els = [];
  }
}

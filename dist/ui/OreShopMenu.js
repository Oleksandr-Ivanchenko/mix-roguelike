import { ORE_SHORT } from "../config/items.js";

const UPGRADES = [
  { label: "+50 макс HP",      icon: "❤️",  cost: { IronOre: 2 },                       apply: s => { s.playerMaxHP += 50; s.playerHP = Math.min(s.playerHP + 30, s.playerMaxHP); s.hud.refreshHP(s.playerHP, s.playerMaxHP); } },
  { label: "+15% урон",        icon: "⚔️",  cost: { CopperOre: 2 },                     apply: s => { s.damageMult += 0.15; } },
  { label: "+20% скорость",    icon: "👟",  cost: { IronOre: 1, CopperOre: 1 },         apply: s => { s.moveSpeed += 36; } },
  { label: "+15 брони",        icon: "🛡️",  cost: { IronOre: 2, CopperOre: 1 },         apply: s => { s.armor += 15; } },
  { label: "+2 HP/сек",        icon: "🌿",  cost: { GoldOre: 1 },                       apply: s => { s.hpRegen += 2; } },
  { label: "+1 снаряд",        icon: "🏹",  cost: { GoldOre: 2 },                       apply: s => { s.multishot += 1; } },
  { label: "+15% крит",        icon: "🎯",  cost: { GoldOre: 1, PlatinumOre: 1 },       apply: s => { s.critChance += 0.15; } },
  { label: "+20% скор.атаки",  icon: "⚡",  cost: { CopperOre: 2, GoldOre: 1 },         apply: s => { s.cooldownMult *= 0.80; } },
  { label: "+5 HP/удар",       icon: "🩸",  cost: { GoldOre: 1, PlatinumOre: 1 },       apply: s => { s.lifesteal += 5; } },
  { label: "+25% опыта",       icon: "⭐",  cost: { CopperOre: 1, GoldOre: 1 },         apply: s => { s.xpMult += 0.25; } },
  { label: "Щит (10 сек)",     icon: "✨",  cost: { MythrilOre: 1 },                    apply: s => { s.divineShield = true; } },
  { label: "×2 урон (20 сек)", icon: "💥",  cost: { ObsidianChunk: 1 },                apply: s => { s.damageMult *= 2; s.time.delayedCall(20000, () => { s.damageMult /= 2; }); } },
];

const MAX_BUYS_PER_VISIT = 3;

export class OreShopMenu {
  constructor(scene) {
    this.scene        = scene;
    this._els         = [];
    this.isOpen       = false;
    this._buysLeft    = MAX_BUYS_PER_VISIT;
    this._rerollCost  = 1; // IronOre cost, doubles each reroll
    this._activeIdxs  = null; // shuffled subset shown
  }

  toggle() {
    this.isOpen ? this.hide() : this.show();
  }

  show() {
    this.isOpen    = true;
    this._buysLeft = MAX_BUYS_PER_VISIT;
    this._rerollCost = 1;
    this._activeIdxs = this._rollUpgrades();
    if (!this.scene._waveComplete) this.scene.physics.pause();
    this.scene.shopOpen = true;
    this._build();
  }

  _rollUpgrades() {
    // Show 6 random upgrades each visit
    const idxs = UPGRADES.map((_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    return idxs.slice(0, 6);
  }

  hide() {
    this.isOpen = false;
    this.scene.shopOpen = false;
    if (!this.scene._waveComplete) this.scene.physics.resume();
    this._els.forEach(e => e.destroy());
    this._els = [];
  }

  _build() {
    this._els.forEach(e => e.destroy());
    this._els = [];

    const s     = this.scene;
    const W     = s.cameras.main.width;
    const H     = s.cameras.main.height;
    const cols  = 3;
    const cardW = 168;
    const cardH = 128;
    const gap   = 10;
    const shown = this._activeIdxs.map(i => UPGRADES[i]);
    const rows  = Math.ceil(shown.length / cols);
    const gridW = cols * cardW + (cols - 1) * gap;
    const gridH = rows * cardH + (rows - 1) * gap;
    const sx    = W / 2 - gridW / 2;
    const sy    = H / 2 - gridH / 2 - 30;

    this._push(s.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.92).setScrollFactor(0).setDepth(70));

    this._push(s.add.text(W / 2, sy - 50, "🔧  МАГАЗИН РУД", {
      fontSize: "24px", color: "#ffdd44", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71));

    // Покупок осталось
    this._push(s.add.text(W / 2, sy - 24, `Покупок осталось: ${this._buysLeft} / ${MAX_BUYS_PER_VISIT}`, {
      fontSize: "12px", color: this._buysLeft > 0 ? "#88ff88" : "#ff4444",
      fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71));

    const invStr = Object.entries(s.ores)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${ORE_SHORT[k]}×${v}`).join("   ") || "— руд нет —";
    this._push(s.add.text(W / 2, sy - 6, invStr, {
      fontSize: "12px", color: "#aabbcc", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71));

    // Cards
    shown.forEach((upg, i) => {
      const col  = i % cols;
      const row  = Math.floor(i / cols);
      const bx   = sx + col * (cardW + gap);
      const by   = sy + row * (cardH + gap);
      const mid  = bx + cardW / 2;
      const can  = this._buysLeft > 0 && this._canAfford(upg.cost);

      const bg = s.add.rectangle(mid, by + cardH / 2, cardW, cardH, can ? 0x1a2233 : 0x111118)
        .setScrollFactor(0).setDepth(71).setStrokeStyle(1, can ? 0x4455aa : 0x222233);
      const icon = s.add.text(mid, by + 20, upg.icon, { fontSize: "20px" })
        .setOrigin(0.5).setScrollFactor(0).setDepth(72);
      const lbl = s.add.text(mid, by + 46, upg.label, {
        fontSize: "11px", color: can ? "#ffffff" : "#444455",
        fontFamily: "monospace", align: "center", wordWrap: { width: cardW - 16 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(72);
      const costStr = Object.entries(upg.cost).map(([k, v]) => `${ORE_SHORT[k]}×${v}`).join("  ");
      const costTxt = s.add.text(mid, by + 82, costStr, {
        fontSize: "10px", color: can ? "#ffcc66" : "#554433",
        fontFamily: "monospace", align: "center"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(72);

      const btnY  = by + cardH - 14;
      const btnBg = s.add.rectangle(mid, btnY, cardW - 20, 20, can ? 0x2244aa : 0x151520)
        .setScrollFactor(0).setDepth(72).setStrokeStyle(1, can ? 0x5566dd : 0x222233);
      const btnTxt = s.add.text(mid, btnY, can ? "КУПИТЬ" : (this._buysLeft <= 0 ? "ЛИМИТ" : "МАЛО РУД"), {
        fontSize: "10px", color: can ? "#aabbff" : "#333344",
        fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(73);
      this._push(bg, icon, lbl, costTxt, btnBg, btnTxt);

      if (can) {
        btnBg.setInteractive({ useHandCursor: true });
        btnBg.on("pointerover", () => { btnBg.setFillStyle(0x3355cc); btnTxt.setStyle({ color: "#ffffff" }); });
        btnBg.on("pointerout",  () => { btnBg.setFillStyle(0x2244aa); btnTxt.setStyle({ color: "#aabbff" }); });
        btnBg.on("pointerdown", () => {
          this._deduct(upg.cost);
          upg.apply(s);
          s.hud?.refreshOres?.(s.ores);
          this._buysLeft--;
          this._build();
        });
      }
    });

    // Реролл
    const rerollY = sy + gridH + 22;
    const rerollCost = `Fe×${this._rerollCost}`;
    const canReroll  = (s.ores?.IronOre || 0) >= this._rerollCost;
    const rb = s.add.rectangle(W / 2, rerollY, 200, 28, canReroll ? 0x1a1a00 : 0x111110)
      .setScrollFactor(0).setDepth(71).setStrokeStyle(1, canReroll ? 0x888800 : 0x333322)
      .setInteractive({ useHandCursor: canReroll });
    const rt = s.add.text(W / 2, rerollY, `🎲 Реролл (${rerollCost})`, {
      fontSize: "11px", color: canReroll ? "#dddd44" : "#444433", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(72);
    this._push(rb, rt);
    if (canReroll) {
      rb.on("pointerover", () => rb.setFillStyle(0x2a2a00));
      rb.on("pointerout",  () => rb.setFillStyle(0x1a1a00));
      rb.on("pointerdown", () => {
        if (!this._canAfford({ IronOre: this._rerollCost })) return;
        this._deduct({ IronOre: this._rerollCost });
        this._rerollCost = Math.min(this._rerollCost * 2, 16);
        this._activeIdxs = this._rollUpgrades();
        s.hud?.refreshOres?.(s.ores);
        this._build();
      });
    }

    this._push(s.add.text(W / 2, rerollY + 24, "[E] — закрыть", {
      fontSize: "10px", color: "#334455", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71));
  }

  _push(...items) { items.forEach(e => this._els.push(e)); }

  _canAfford(cost) {
    return Object.entries(cost).every(([k, v]) => (this.scene.ores[k] || 0) >= v);
  }

  _deduct(cost) {
    for (const [k, v] of Object.entries(cost)) {
      this.scene.ores[k] = (this.scene.ores[k] || 0) - v;
    }
  }
}

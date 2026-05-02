import { CRAFTED_SKILLS } from "../config/craftedSkills.js";
import { ORE_SHORT } from "../config/items.js";

const RARITY_COLOR = { common: "#66aa66", rare: "#4488ff", epic: "#cc44ff", legendary: "#ffaa00" };
const RARITY_BG    = { common: 0x0e1a0e,  rare: 0x080e1e,  epic: 0x10061a,  legendary: 0x1e0e00 };
const RARITY_BDR   = { common: 0x335533,  rare: 0x224499,  epic: 0x771199,  legendary: 0x995500 };

const STAT_DEFS = [
  { key: "str", label: "STR", color: "#ff6644", desc: "+10% урон",    apply: s => { s.damageMult += 0.10; } },
  { key: "dex", label: "DEX", color: "#44ffaa", desc: "+15 скор +3%крит", apply: s => { s.moveSpeed += 15; s.critChance += 0.03; } },
  { key: "vit", label: "VIT", color: "#ff4466", desc: "+20 HP +0.5реген", apply: s => { s.playerMaxHP += 20; s.playerHP = Math.min(s.playerHP + 20, s.playerMaxHP); s.hpRegen += 0.5; s.hud.refreshHP(s.playerHP, s.playerMaxHP); } },
  { key: "int", label: "INT", color: "#4488ff", desc: "+20 ман −5%КД",   apply: s => { s.maxMana += 20; s.cooldownMult *= 0.95; } },
];

export class SkillForgeMenu {
  constructor(scene) {
    this.scene  = scene;
    this._els   = [];
    this.isOpen = false;
  }

  toggle() { this.isOpen ? this.hide() : this.show(); }

  show() {
    this.isOpen = true;
    this.scene.physics.pause();
    this.scene.forgeOpen = true;
    this._build();
  }

  hide() {
    this.isOpen = false;
    this.scene.forgeOpen = false;
    this.scene.physics.resume();
    this._els.forEach(e => e.destroy());
    this._els = [];
  }

  _build() {
    this._els.forEach(e => e.destroy());
    this._els = [];

    const s   = this.scene;
    const W   = s.cameras.main.width;
    const H   = s.cameras.main.height;
    const cls = s.playerClass;

    const skills = CRAFTED_SKILLS.filter(sk => sk.class === cls?.id || sk.class === "both");
    const crafted = s.craftedSkills ?? new Set();

    const cols  = 3;
    const cardW = 168;
    const cardH = 140;
    const gap   = 10;
    const rows  = Math.ceil(skills.length / cols);
    const gridW = cols * cardW + (cols - 1) * gap;
    const gridH = rows * cardH + (rows - 1) * gap;
    const sx    = W / 2 - gridW / 2;
    const sy    = 36;

    // ── Overlay ────────────────────────────────────────────────────────────────
    this._push(s.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.93).setScrollFactor(0).setDepth(70));

    // ── Title ──────────────────────────────────────────────────────────────────
    this._push(s.add.text(W / 2, sy - 22, "⚒  КУЗНИЦА НАВЫКОВ", {
      fontSize: "22px", color: "#cc44ff", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71));

    // ── Ore inventory ──────────────────────────────────────────────────────────
    const invStr = Object.entries(s.ores ?? {}).filter(([, v]) => v > 0)
      .map(([k, v]) => `${ORE_SHORT[k] ?? k}×${v}`).join("  ") || "— руд нет —";
    this._push(s.add.text(W / 2, sy - 4, invStr, {
      fontSize: "11px", color: "#aabbcc", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71));

    // ── Skill cards ────────────────────────────────────────────────────────────
    skills.forEach((sk, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx  = sx + col * (cardW + gap);
      const by  = sy + row * (cardH + gap) + 14;
      const mid = bx + cardW / 2;

      const isCrafted = crafted.has(sk.id);
      const canAfford = !isCrafted && this._canAfford(sk.recipe);
      const rc = RARITY_COLOR[sk.rarity] ?? "#888888";
      const rb = RARITY_BG[sk.rarity]    ?? 0x111111;
      const rd = RARITY_BDR[sk.rarity]   ?? 0x333333;

      const bg = s.add.rectangle(mid, by + cardH / 2, cardW, cardH, isCrafted ? 0x0a1a10 : rb)
        .setScrollFactor(0).setDepth(71)
        .setStrokeStyle(1, isCrafted ? 0x22aa55 : rd);

      const icon = s.add.image(mid, by + 26, sk.icon)
        .setDisplaySize(34, 34).setScrollFactor(0).setDepth(72)
        .setAlpha(isCrafted || canAfford ? 1.0 : 0.35);

      const nameTxt = s.add.text(mid, by + 52, sk.name, {
        fontSize: "10px", color: isCrafted ? "#44ff88" : canAfford ? "#ffffff" : "#444455",
        fontFamily: "monospace", fontStyle: "bold", align: "center", wordWrap: { width: cardW - 12 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(72);

      const descTxt = s.add.text(mid, by + 70, sk.desc, {
        fontSize: "8px", color: "#667788", fontFamily: "monospace", align: "center", wordWrap: { width: cardW - 14 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(72);

      const costStr = Object.entries(sk.recipe).map(([k, v]) => `${ORE_SHORT[k]}×${v}`).join(" ");
      const resIcon = sk.resource === "mana" ? "💧" : "⚡";
      const costTxt = s.add.text(mid, by + 92, `${costStr}  ${resIcon}${sk.cost}`, {
        fontSize: "9px", color: canAfford ? "#ffcc66" : isCrafted ? "#338844" : "#443322",
        fontFamily: "monospace", align: "center"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(72);

      const rarTxt = s.add.text(mid, by + 6, rc === "#66aa66" ? "ОБЫЧНЫЙ" : rc === "#4488ff" ? "РЕДКИЙ" : rc === "#cc44ff" ? "ЭПИЧЕСКИЙ" : "ЛЕГЕНД.", {
        fontSize: "8px", color: rc, fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(72);

      this._push(bg, icon, nameTxt, descTxt, costTxt, rarTxt);

      const btnY  = by + cardH - 12;
      const btnBg = s.add.rectangle(mid, btnY, cardW - 20, 18,
        isCrafted ? 0x113322 : canAfford ? 0x221133 : 0x111118)
        .setScrollFactor(0).setDepth(72)
        .setStrokeStyle(1, isCrafted ? 0x33aa55 : canAfford ? 0x9944cc : 0x222233);
      const btnLabel = isCrafted ? "НАЗНАЧИТЬ [Q/R]" : canAfford ? "СКРАФТИТЬ" : "НЕ ХВАТАЕТ РУД";
      const btnTxt = s.add.text(mid, btnY, btnLabel, {
        fontSize: "9px", color: isCrafted ? "#44cc77" : canAfford ? "#cc88ff" : "#333344",
        fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(73);
      this._push(btnBg, btnTxt);

      if (canAfford) {
        btnBg.setInteractive({ useHandCursor: true });
        btnBg.on("pointerover",  () => btnBg.setFillStyle(0x331144));
        btnBg.on("pointerout",   () => btnBg.setFillStyle(0x221133));
        btnBg.on("pointerdown",  () => { this._craft(sk); });
      } else if (isCrafted) {
        btnBg.setInteractive({ useHandCursor: true });
        btnBg.on("pointerover",  () => btnBg.setFillStyle(0x224433));
        btnBg.on("pointerout",   () => btnBg.setFillStyle(0x113322));
        btnBg.on("pointerdown",  () => { this._assignSkill(sk); });
      }
    });

    // ── STATS section ──────────────────────────────────────────────────────────
    const statsY = sy + gridH + 24;
    const sp = s.statPoints ?? 0;
    this._push(s.add.text(W / 2, statsY, `⬡ ОЧКИ СТАТОВ: ${sp}  (зарабатывается при повышении уровня)`, {
      fontSize: "11px", color: sp > 0 ? "#ffdd44" : "#445566", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71));

    const statW = 130, statH = 46, statGap = 10;
    const statTotalW = STAT_DEFS.length * statW + (STAT_DEFS.length - 1) * statGap;
    const statX = W / 2 - statTotalW / 2;

    STAT_DEFS.forEach((st, i) => {
      const bx  = statX + i * (statW + statGap);
      const mid = bx + statW / 2;
      const by  = statsY + 18;
      const val = s.stats?.[st.key] ?? 0;

      const bg = s.add.rectangle(mid, by + statH / 2, statW, statH, sp > 0 ? 0x1a1a2a : 0x111118)
        .setScrollFactor(0).setDepth(71)
        .setStrokeStyle(1, sp > 0 ? 0x4455aa : 0x222233);

      const lbl = s.add.text(mid, by + 10, `${st.label} ${val}`, {
        fontSize: "13px", color: st.color, fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(72);

      const desc = s.add.text(mid, by + 26, st.desc, {
        fontSize: "8px", color: "#667788", fontFamily: "monospace", align: "center"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(72);

      const btnTxt = s.add.text(mid, by + 38, sp > 0 ? "+1" : "—", {
        fontSize: "9px", color: sp > 0 ? "#ffffff" : "#333344",
        fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(72);

      this._push(bg, lbl, desc, btnTxt);

      if (sp > 0) {
        bg.setInteractive({ useHandCursor: true });
        bg.on("pointerover", () => bg.setFillStyle(0x2a2a3a));
        bg.on("pointerout",  () => bg.setFillStyle(0x1a1a2a));
        bg.on("pointerdown", () => {
          s.statPoints--;
          if (!s.stats) s.stats = { str: 0, dex: 0, vit: 0, int: 0 };
          s.stats[st.key]++;
          st.apply(s);
          this._build();
        });
      }
    });

    // ── Slot status ────────────────────────────────────────────────────────────
    const slots = s.activeSkillSlots ?? [null, null];
    const slotStr = `[Q] ${slots[0]?.name ?? "—"}    [F] ${slots[1]?.name ?? "—"}`;
    this._push(s.add.text(W / 2, statsY + statH + 28, slotStr, {
      fontSize: "11px", color: "#667788", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71));

    // ── Close hint ─────────────────────────────────────────────────────────────
    this._push(s.add.text(W / 2, H - 12, "[TAB] — закрыть кузницу", {
      fontSize: "10px", color: "#334455", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(71));
  }

  _craft(sk) {
    const s = this.scene;
    this._deduct(sk.recipe);
    if (!s.craftedSkills) s.craftedSkills = new Set();
    s.craftedSkills.add(sk.id);
    s.hud?.refreshOres?.(s.ores);
    this._assignSkill(sk);
  }

  _assignSkill(sk) {
    const s = this.scene;
    if (!s.activeSkillSlots) s.activeSkillSlots = [null, null];
    if (!s.activeSkillSlots[0])      s.activeSkillSlots[0] = sk;
    else if (!s.activeSkillSlots[1]) s.activeSkillSlots[1] = sk;
    else { s.activeSkillSlots[0] = s.activeSkillSlots[1]; s.activeSkillSlots[1] = sk; }
    s.hud?.refreshSkillSlots?.(s.activeSkillSlots, s.skillCooldowns ?? {}, s.time.now);
    this._build();
  }

  _canAfford(recipe) {
    return Object.entries(recipe).every(([k, v]) => (this.scene.ores?.[k] ?? 0) >= v);
  }

  _deduct(recipe) {
    for (const [k, v] of Object.entries(recipe)) this.scene.ores[k] = (this.scene.ores[k] ?? 0) - v;
  }

  _push(...items) { items.forEach(e => this._els.push(e)); }
}

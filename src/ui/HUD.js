import { ORE_KEYS } from "../config/items.js";

export class HUD {
  constructor(scene) {
    this.scene       = scene;
    this._hpFill     = null;
    this._hpTxt      = null;
    this._xpFill     = null;
    this._xpTxt      = null;
    this._lvlTxt     = null;
    this._scoreTxt   = null;
    this._goldTxt    = null;
    this._statPtTxt  = null;
    this._timerTxt   = null;
    this._manaFill   = null;
    this._manaTxt    = null;
    this._stamFill   = null;
    this._stamTxt    = null;
    this._oreTxts    = {};
    this._slotBgs    = [null, null];
    this._slotNames  = [null, null];
    this._slotCdRect = [null, null];
  }

  build() {
    const s = this.scene;
    const W = s.cameras.main.width;
    const H = s.cameras.main.height;

    // ── HP bar ───────────────────────────────────────────────────────────────
    s.add.rectangle(12, 12, 184, 16, 0x000000, 0.75).setScrollFactor(0).setDepth(20).setOrigin(0);
    s.add.rectangle(14, 14, 180, 12, 0x550000).setScrollFactor(0).setDepth(21).setOrigin(0);
    this._hpFill = s.add.rectangle(14, 14, 180, 12, 0xff2244).setScrollFactor(0).setDepth(22).setOrigin(0);
    this._hpTxt  = s.add.text(200, 13, "HP 100/100", {
      fontSize: "11px", color: "#ffffff", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(22);

    // ── XP bar ──────────────────────────────────────────────────────────────
    s.add.rectangle(12, 30, 184, 8, 0x000000, 0.75).setScrollFactor(0).setDepth(20).setOrigin(0);
    s.add.rectangle(14, 32, 180, 5, 0x223300).setScrollFactor(0).setDepth(21).setOrigin(0);
    this._xpFill = s.add.rectangle(14, 32, 0, 5, 0x44ff88).setScrollFactor(0).setDepth(22).setOrigin(0);
    this._xpTxt  = s.add.text(200, 29, "XP 0", {
      fontSize: "10px", color: "#44ff88", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(22);

    // ── Mana bar (blue) ──────────────────────────────────────────────────────
    s.add.rectangle(12, 40, 184, 7, 0x000000, 0.75).setScrollFactor(0).setDepth(20).setOrigin(0);
    s.add.rectangle(14, 42, 180, 4, 0x001133).setScrollFactor(0).setDepth(21).setOrigin(0);
    this._manaFill = s.add.rectangle(14, 42, 180, 4, 0x2266ff).setScrollFactor(0).setDepth(22).setOrigin(0);
    this._manaTxt  = s.add.text(200, 39, "MP 100", {
      fontSize: "9px", color: "#4488ff", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(22);

    // ── Stamina bar (yellow) ─────────────────────────────────────────────────
    s.add.rectangle(12, 49, 184, 7, 0x000000, 0.75).setScrollFactor(0).setDepth(20).setOrigin(0);
    s.add.rectangle(14, 51, 180, 4, 0x221100).setScrollFactor(0).setDepth(21).setOrigin(0);
    this._stamFill = s.add.rectangle(14, 51, 180, 4, 0xffaa00).setScrollFactor(0).setDepth(22).setOrigin(0);
    this._stamTxt  = s.add.text(200, 48, "SP 100", {
      fontSize: "9px", color: "#ffaa00", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(22);

    // ── Level / Score / Gold / StatPoints ────────────────────────────────────
    this._lvlTxt = s.add.text(14, 60, "Ур. 1", {
      fontSize: "12px", color: "#ffdd44", fontFamily: "monospace", fontStyle: "bold"
    }).setScrollFactor(0).setDepth(22);
    this._scoreTxt = s.add.text(14, 74, "Очки: 0", {
      fontSize: "12px", color: "#ffdd44", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(22);
    this._goldTxt = s.add.text(14, 88, "⬡ 0", {
      fontSize: "12px", color: "#ffcc00", fontFamily: "monospace"
    }).setScrollFactor(0).setDepth(22);
    this._statPtTxt = s.add.text(14, 102, "", {
      fontSize: "11px", color: "#ffdd44", fontFamily: "monospace", fontStyle: "bold"
    }).setScrollFactor(0).setDepth(22);

    // ── Timer + wave counter (top center) ───────────────────────────────────
    s.add.rectangle(W / 2, 8, 200, 40, 0x000000, 0.65).setScrollFactor(0).setDepth(20).setOrigin(0.5, 0);
    this._timerTxt = s.add.text(W / 2, 10, "00:00", {
      fontSize: "18px", color: "#ffffff", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(22);
    this._waveTxt = s.add.text(W / 2, 30, "0 / 1000", {
      fontSize: "10px", color: "#888888", fontFamily: "monospace"
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(22);

    // ── Ore panel (top right) ────────────────────────────────────────────────
    const oreX = W - 8;
    ORE_KEYS.forEach((key, i) => {
      const oy = 10 + i * 17;
      s.add.image(oreX - 36, oy + 7, key).setDisplaySize(13, 13).setScrollFactor(0).setDepth(22).setOrigin(0.5);
      this._oreTxts[key] = s.add.text(oreX - 26, oy, "×0", {
        fontSize: "11px", color: "#333344", fontFamily: "monospace"
      }).setScrollFactor(0).setDepth(22);
    });

    // ── Skill slots (bottom left: Q and F) ──────────────────────────────────
    const slotKeys = ["Q", "F"];
    const slotY    = H - 56;
    slotKeys.forEach((key, i) => {
      const bx  = 14 + i * 124;
      const mid = bx + 56;
      const bg  = s.add.rectangle(mid, slotY + 20, 112, 40, 0x111122, 0.9)
        .setScrollFactor(0).setDepth(22)
        .setStrokeStyle(1, 0x333355).setOrigin(0.5);
      s.add.text(bx + 4, slotY + 4, `[${key}]`, {
        fontSize: "9px", color: "#445566", fontFamily: "monospace"
      }).setScrollFactor(0).setDepth(23);
      const nameTxt = s.add.text(mid, slotY + 28, "—", {
        fontSize: "9px", color: "#445566", fontFamily: "monospace", align: "center"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(23);
      const cdRect = s.add.rectangle(mid, slotY + 20, 112, 40, 0x000000, 0)
        .setScrollFactor(0).setDepth(24).setOrigin(0.5);
      this._slotBgs[i]    = bg;
      this._slotNames[i]  = nameTxt;
      this._slotCdRect[i] = cdRect;
    });

    // ── Bottom hint ──────────────────────────────────────────────────────────
    s.add.text(W / 2, H - 14, "WASD движение  [SHIFT] спринт  [SPACE] уклон  [CTRL] блок  [E] магазин  [TAB] кузница  [Q][F] навыки", {
      fontSize: "9px", color: "#333344", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(22);
  }

  refreshHP(hp, maxHp) {
    this._hpFill.displayWidth = 180 * Math.max(0, hp / maxHp);
    this._hpTxt.setText(`HP ${Math.ceil(hp)}/${maxHp}`);
  }

  refreshXP(xp, xpNeeded, level) {
    this._xpFill.displayWidth = 180 * (xp / xpNeeded);
    this._xpTxt.setText(`XP ${xp}/${xpNeeded}`);
    this._lvlTxt.setText(`Ур. ${level}`);
  }

  refreshScore(score) { this._scoreTxt.setText("Очки: " + score); }
  refreshWave(kills, target) {
    const waveNum = this.scene.waveNumber || 1;
    this._waveTxt?.setText(`Волна ${waveNum}: ${kills} / ${target}`);
  }
  refreshGold(gold)   { this._goldTxt.setText(`⬡ ${gold}`); }

  refreshTimer(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    this._timerTxt.setText(`${m}:${s}`);
  }

  refreshMana(mana, maxMana) {
    this._manaFill.displayWidth = 180 * Math.max(0, mana / maxMana);
    this._manaTxt.setText(`MP ${Math.ceil(mana)}`);
  }

  refreshStamina(stamina, maxStamina) {
    const pct = Math.max(0, stamina / maxStamina);
    this._stamFill.displayWidth = 180 * pct;
    this._stamFill.setFillStyle(pct < 0.01 ? 0xff2200 : 0xffaa00);
    this._stamTxt.setText(`SP ${Math.ceil(stamina)}`);
    this._stamTxt.setColor(pct < 0.01 ? "#ff4400" : "#ffaa00");
  }

  refreshOres(ores) {
    for (const [key, txt] of Object.entries(this._oreTxts)) {
      const count = ores[key] || 0;
      txt.setText(`×${count}`);
      txt.setColor(count > 0 ? "#ffffff" : "#333344");
    }
  }

  refreshStatPoints(points) {
    this._statPtTxt.setText(points > 0 ? `★ СТАТ.ОЧКИ: ${points}` : "");
  }

  refreshSkillSlots(slots, cooldowns, now) {
    slots?.forEach((sk, i) => {
      const name = this._slotNames[i];
      const bg   = this._slotBgs[i];
      const cd   = this._slotCdRect[i];
      if (!name) return;
      if (!sk) { name.setText("—"); name.setColor("#445566"); bg.setStrokeStyle(1, 0x333355); cd.setAlpha(0); return; }
      name.setText(sk.name);
      const remaining = sk.cooldown - (now - (cooldowns[sk.id] ?? 0));
      const onCd      = remaining > 0;
      bg.setStrokeStyle(1, onCd ? 0x334455 : sk.resource === "mana" ? 0x2266ff : 0xffaa00);
      name.setColor(onCd ? "#445566" : "#ccddff");
      cd.setAlpha(onCd ? 0.55 : 0);
    });
  }
}

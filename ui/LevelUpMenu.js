import { RARITY } from "../config/skills.js";

export class LevelUpMenu {
  constructor(scene) {
    this.scene = scene;
  }

  show(level, choices, onPick) {
    const s = this.scene;
    const W = s.cameras.main.width;
    const H = s.cameras.main.height;

    const cardW = 185;
    const cardH = 152;
    const gap   = 14;
    const totalW = choices.length * cardW + (choices.length - 1) * gap;
    const startX = W / 2 - totalW / 2;
    const startY = H / 2 - cardH / 2 - 20;

    const elements = [];

    // Затемнение
    const overlay = s.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.80)
      .setScrollFactor(0).setDepth(50);
    elements.push(overlay);

    // Заголовок
    const titleTxt = s.add.text(W / 2, startY - 52, `⬆  УРОВЕНЬ ${level}`, {
      fontSize: "28px", color: "#ffdd44", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
    const subTxt = s.add.text(W / 2, startY - 20, "Выбери улучшение:", {
      fontSize: "14px", color: "#888899", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
    elements.push(titleTxt, subTxt);

    choices.forEach((skill, i) => {
      const bx  = startX + i * (cardW + gap);
      const by  = startY;
      const mid = bx + cardW / 2;
      const r   = RARITY[skill.rarity] ?? RARITY.common;

      // Фон карточки
      const bg = s.add.rectangle(mid, by + cardH / 2, cardW, cardH, r.bg)
        .setScrollFactor(0).setDepth(51)
        .setStrokeStyle(2, r.border);

      // Плашка редкости
      const rarityBg = s.add.rectangle(mid, by + 12, cardW - 2, 22, r.border, 0.7)
        .setScrollFactor(0).setDepth(52);
      const rarityTxt = s.add.text(mid, by + 12, r.label, {
        fontSize: "10px", color: r.color, fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(53);

      // Иконка
      const iconTxt = s.add.text(mid, by + 52, skill.icon, {
        fontSize: "30px"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(52);

      // Название
      const labelTxt = s.add.text(mid, by + 92, skill.label, {
        fontSize: "12px", color: "#ffffff", fontFamily: "monospace",
        align: "center", fontStyle: "bold",
        wordWrap: { width: cardW - 16 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(52);

      // Уникальный бейдж
      if (skill.unique) {
        const uTxt = s.add.text(mid, by + cardH - 14, "✦ УНИКАЛЬНЫЙ", {
          fontSize: "9px", color: r.color, fontFamily: "monospace"
        }).setOrigin(0.5).setScrollFactor(0).setDepth(53);
        elements.push(uTxt);
      }

      elements.push(bg, rarityBg, rarityTxt, iconTxt, labelTxt);

      // Интерактив
      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => {
        bg.setFillStyle(r.border).setStrokeStyle(2, 0xffffff);
        labelTxt.setStyle({ color: "#ffdd44" });
      });
      bg.on("pointerout", () => {
        bg.setFillStyle(r.bg).setStrokeStyle(2, r.border);
        labelTxt.setStyle({ color: "#ffffff" });
      });
      bg.on("pointerdown", () => {
        elements.forEach(el => el.destroy());
        onPick(skill);
      });
    });
  }
}

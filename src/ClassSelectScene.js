import Phaser from "phaser";
import { CLASSES } from "./config/classes.js";

export default class ClassSelectScene extends Phaser.Scene {
  constructor() { super("ClassSelectScene"); }

  preload() {
    this.load.image("hero_archer",  "assets/Heroes/archer.png");
    this.load.image("hero_warrior", "assets/Heroes/warrior.png");
  }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Фон
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a14);

    // Заголовок
    this.add.text(W / 2, 36, "ВЫБЕРИ КЛАСС", {
      fontSize: "30px", color: "#ffdd44",
      fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5);

    const classList = Object.values(CLASSES);
    const cols      = 4;
    const cardW     = 270;
    const cardH     = 180;
    const gapX      = 18;
    const gapY      = 18;
    const rows      = Math.ceil(classList.length / cols);
    const gridW     = cols * cardW + (cols - 1) * gapX;
    const gridH     = rows * cardH + (rows - 1) * gapY;
    const startX    = (W - gridW) / 2;
    const startY    = (H - gridH) / 2 + 20;

    let locked = false;

    classList.forEach((cls, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx  = startX + col * (cardW + gapX);
      const cy  = startY + row * (cardH + gapY);

      this._makeCard(cx, cy, cardW, cardH, cls, () => {
        if (locked) return;
        locked = true;
        this.registry.set("playerClass", cls);
        this.scene.start("GameScene");
      });
    });

    // Кнопка назад
    const backTxt = this.add.text(30, H - 30, "← Назад", {
      fontSize: "14px", color: "#555566", fontFamily: "monospace"
    }).setOrigin(0, 1).setInteractive({ useHandCursor: true });
    backTxt.on("pointerover", () => backTxt.setStyle({ color: "#aaaacc" }));
    backTxt.on("pointerout",  () => backTxt.setStyle({ color: "#555566" }));
    backTxt.on("pointerdown", () => this.scene.start("MainMenuScene"));
  }

  _makeCard(x, y, w, h, cls, onSelect) {
    const hasPortrait = !!cls.heroKey;

    // Фон карточки
    const bg = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x14141e)
      .setStrokeStyle(1, 0x333355)
      .setInteractive({ useHandCursor: true });

    // Портрет или цветная плашка
    if (hasPortrait) {
      const portrait = this.add.image(x + w / 2, y + h / 2 - 18, cls.heroKey)
        .setDisplaySize(w - 8, h - 52)
        .setDepth(1);
      // Чтобы не выходил за карточку
      portrait.setMask(
        this.add.graphics()
          .fillStyle(0xffffff)
          .fillRect(x + 4, y + 4, w - 8, h - 52)
          .createGeometryMask()
      );
    } else {
      // Заглушка — цветной прямоугольник с буквой
      const colors = {
        mage:        0x3322aa,
        rogue:       0x222222,
        paladin:     0xaa8800,
        summoner:    0x442255,
        hunter:      0x225522,
        necromancer: 0x221122,
      };
      const col = colors[cls.id] || 0x222233;
      this.add.rectangle(x + w / 2, y + h / 2 - 18, w - 8, h - 52, col).setDepth(1);
      this.add.text(x + w / 2, y + h / 2 - 18, cls.name[0], {
        fontSize: "48px", color: "#ffffff88", fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setDepth(2);
    }

    // Название класса
    this.add.text(x + w / 2, y + h - 34, cls.name, {
      fontSize: "15px", color: "#ffffff", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setDepth(2);

    // Тип атаки
    const typeLabel = cls.attackType === "melee" ? "Ближний бой" : "Дальний бой";
    this.add.text(x + w / 2, y + h - 16, typeLabel, {
      fontSize: "10px", color: "#888899", fontFamily: "monospace"
    }).setOrigin(0.5).setDepth(2);

    // Hover
    bg.on("pointerover", () => {
      bg.setStrokeStyle(2, 0xffdd44);
      bg.setFillStyle(0x1e1e2e);
    });
    bg.on("pointerout", () => {
      bg.setStrokeStyle(1, 0x333355);
      bg.setFillStyle(0x14141e);
    });
    bg.on("pointerdown", onSelect);
  }
}

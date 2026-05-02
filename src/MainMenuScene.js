import Phaser from "phaser";

export default class MainMenuScene extends Phaser.Scene {
  constructor() { super("MainMenuScene"); }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Фон
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a14);

    // Декоративные частицы-звёзды
    for (let i = 0; i < 80; i++) {
      const x    = Phaser.Math.Between(0, W);
      const y    = Phaser.Math.Between(0, H);
      const size = Math.random() < 0.2 ? 2 : 1;
      this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.2, 0.8));
    }

    // Заголовок
    this.add.text(W / 2, H / 2 - 180, "ROGUELIKE ARENA", {
      fontSize: "52px", color: "#ffdd44",
      fontFamily: "monospace", fontStyle: "bold",
      stroke: "#aa6600", strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 120, "выживи как можно дольше", {
      fontSize: "16px", color: "#888888", fontFamily: "monospace"
    }).setOrigin(0.5);

    // Рекорд из localStorage
    const best = localStorage.getItem("bestScore") || 0;
    const bestTime = localStorage.getItem("bestTime") || "00:00";
    this.add.text(W / 2, H / 2 - 76, `Рекорд: ${best} очков   |   Время: ${bestTime}`, {
      fontSize: "14px", color: "#aaaaff", fontFamily: "monospace"
    }).setOrigin(0.5);

    // Кнопка ИГРАТЬ
    this._makeBtn(W / 2, H / 2, "▶  ИГРАТЬ", 0x22aa44, 0x33cc55, () => {
      this.scene.start("ClassSelectScene");
    });

    // Кнопка СБРОСИТЬ РЕКОРД (маленькая)
    const resetTxt = this.add.text(W / 2, H / 2 + 170, "сбросить рекорд", {
      fontSize: "11px", color: "#333344", fontFamily: "monospace"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resetTxt.on("pointerover", () => resetTxt.setStyle({ color: "#666677" }));
    resetTxt.on("pointerout",  () => resetTxt.setStyle({ color: "#333344" }));
    resetTxt.on("pointerdown", () => {
      localStorage.removeItem("bestScore");
      localStorage.removeItem("bestTime");
      this.scene.restart();
    });

    // Подсказка управления
    this.add.text(W / 2, H - 30, "WASD — движение   Авто-атака на ближайшего врага   Space — активный скилл", {
      fontSize: "11px", color: "#444455", fontFamily: "monospace"
    }).setOrigin(0.5);
  }

  _makeBtn(x, y, label, color, hoverColor, cb) {
    const bg = this.add.rectangle(x, y, 240, 54, color, 1)
      .setStrokeStyle(2, 0xffffff, 0.3)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontSize: "22px", color: "#ffffff",
      fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5);

    bg.on("pointerover",  () => { bg.setFillStyle(hoverColor); bg.setScale(1.04); txt.setScale(1.04); });
    bg.on("pointerout",   () => { bg.setFillStyle(color);      bg.setScale(1);    txt.setScale(1); });
    bg.on("pointerdown",  cb);
  }
}

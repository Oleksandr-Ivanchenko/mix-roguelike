import Phaser from "phaser";
import { getLeaderboard } from "./GameScene.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() { super("MainMenuScene"); }

  create() {
    // Сбросить номер волны при входе в меню
    this.registry.set("waveNumber", 1);

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a14);
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, W), y = Phaser.Math.Between(0, H);
      const size = Math.random() < 0.2 ? 2 : 1;
      this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.2, 0.8));
    }

    this.add.text(W / 2, 36, "ROGUELIKE ARENA", {
      fontSize: "48px", color: "#ffdd44",
      fontFamily: "monospace", fontStyle: "bold",
      stroke: "#aa6600", strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(W / 2, 88, "выживи как можно дольше — 1000 врагов = волна пройдена", {
      fontSize: "13px", color: "#666677", fontFamily: "monospace"
    }).setOrigin(0.5);

    // ── Кнопка ИГРАТЬ ───────────────────────────────────────────────────────
    this._makeBtn(W / 2, 148, "▶  ИГРАТЬ", 0x22aa44, 0x33cc55, () => {
      this.scene.start("ClassSelectScene");
    });

    // ── Таблица рекордов ─────────────────────────────────────────────────────
    const board = getLeaderboard();
    const bx = W / 2;
    const by = 210;

    this.add.rectangle(bx, by + 100, 560, 220, 0x0d0d1a, 0.9)
      .setStrokeStyle(1, 0x333355).setOrigin(0.5);

    this.add.text(bx, by, "🏆 ТАБЛИЦА РЕКОРДОВ", {
      fontSize: "16px", color: "#ffdd44", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5);

    if (board.length === 0) {
      this.add.text(bx, by + 90, "Пока нет результатов — сыграй первым!", {
        fontSize: "13px", color: "#444455", fontFamily: "monospace"
      }).setOrigin(0.5);
    } else {
      const cols = ["#", "Имя", "Класс", "Волна", "Ур.", "Убийств", "Очки"];
      const colX = [bx - 258, bx - 220, bx - 140, bx - 60, bx + 10, bx + 60, bx + 160];
      cols.forEach((c, i) => this.add.text(colX[i], by + 22, c, {
        fontSize: "10px", color: "#888899", fontFamily: "monospace"
      }).setOrigin(0));

      board.slice(0, 8).forEach((r, idx) => {
        const rowY = by + 38 + idx * 20;
        const color = idx === 0 ? "#ffdd44" : idx <= 2 ? "#aaaaff" : "#667788";
        const name = (r.name || "Игрок").slice(0, 9);
        const row = [
          `${idx + 1}.`, name, r.cls || "?", `В${r.wave || 1}`,
          `${r.level}`, `${r.kills}`, `${r.score}`
        ];
        row.forEach((v, i) => this.add.text(colX[i], rowY, v, {
          fontSize: "11px", color, fontFamily: "monospace"
        }).setOrigin(0));
      });
    }

    // ── Сбросить рекорды ─────────────────────────────────────────────────────
    const resetTxt = this.add.text(bx, by + 210, "сбросить таблицу", {
      fontSize: "10px", color: "#222233", fontFamily: "monospace"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resetTxt.on("pointerover", () => resetTxt.setStyle({ color: "#555566" }));
    resetTxt.on("pointerout",  () => resetTxt.setStyle({ color: "#222233" }));
    resetTxt.on("pointerdown", () => {
      localStorage.removeItem("roguelike_leaderboard");
      this.scene.restart();
    });

    this.add.text(W / 2, H - 18,
      "WASD движение  |  Space уклон  |  Shift спринт  |  E магазин  |  TAB кузница  |  Q/F навыки", {
      fontSize: "10px", color: "#ff0000", fontFamily: "monospace"
    }).setOrigin(0.5);
  }

  _makeBtn(x, y, label, color, hoverColor, cb) {
    const bg = this.add.rectangle(x, y, 240, 50, color, 1)
      .setStrokeStyle(2, 0xffffff, 0.3).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontSize: "22px", color: "#ffffff", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5);
    bg.on("pointerover",  () => { bg.setFillStyle(hoverColor); bg.setScale(1.04); txt.setScale(1.04); });
    bg.on("pointerout",   () => { bg.setFillStyle(color);      bg.setScale(1);    txt.setScale(1); });
    bg.on("pointerdown",  cb);
  }
}

import { WEAPONS } from "../config/weapons.js";

export class WeaponPanel {
  constructor(scene) {
    this.scene = scene;
    this._btns = [];
  }

  build(playerClass, selectedWeapon, onSelect) {
    const s = this.scene;
    const W = s.cameras.main.width;
    const H = s.cameras.main.height;

    // Только оружия доступные классу
    const available = playerClass.allowedWeapons.filter(w => WEAPONS[w]);

    const btnW   = 84;
    const panelW = available.length * btnW + 8;
    const panelX = W / 2 - panelW / 2;
    const panelY = H - 70;

    s.add.rectangle(panelX - 4, panelY - 4, panelW + 8, 70, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(20).setOrigin(0);

    this._btns = available.map((w, i) => {
      const bx  = panelX + i * btnW;
      const by  = panelY;
      const on  = w === selectedWeapon;
      const cfg = WEAPONS[w];

      const bg = s.add.rectangle(bx + btnW / 2, by + 25, btnW - 6, 50, on ? 0x443300 : 0x1a1a1a)
        .setScrollFactor(0).setDepth(21)
        .setStrokeStyle(on ? 2 : 1, on ? 0xffdd00 : 0x444444)
        .setInteractive({ useHandCursor: true });

      const num = s.add.text(bx + 6, by + 6, String(i + 1), {
        fontSize: "10px", color: on ? "#ffdd00" : "#666666", fontFamily: "monospace"
      }).setScrollFactor(0).setDepth(23);

      // Иконка оружия если есть спрайт
      if (cfg.iconKey) {
        s.add.image(bx + btnW / 2, by + 20, cfg.iconKey)
          .setDisplaySize(22, 22)
          .setScrollFactor(0).setDepth(24);
      }

      const lbl = s.add.text(bx + btnW / 2, by + 38, cfg.iconKey ? "" : w, {
        fontSize: "10px", color: on ? "#ffdd00" : "#888888",
        fontFamily: "monospace", align: "center"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(23);

      bg.on("pointerdown", (ptr) => {
        ptr.event.stopPropagation();
        onSelect(w);
      });
      bg.on("pointerover", () => { if (w !== selectedWeapon) bg.setFillStyle(0x2a2a2a); });
      bg.on("pointerout",  () => { if (w !== selectedWeapon) bg.setFillStyle(0x1a1a1a); });

      return { bg, num, lbl, weapon: w };
    });
  }

  refresh(playerClass, selectedWeapon) {
    this._btns.forEach(({ bg, num, lbl, weapon }) => {
      const on = weapon === selectedWeapon;
      bg.setFillStyle(on ? 0x443300 : 0x1a1a1a);
      bg.setStrokeStyle(on ? 2 : 1, on ? 0xffdd00 : 0x444444);
      num.setStyle({ fontSize: "10px", color: on ? "#ffdd00" : "#666666", fontFamily: "monospace" });
      lbl.setStyle({ fontSize: "10px", color: on ? "#ffdd00" : "#888888", fontFamily: "monospace", align: "center" });
    });
  }
}

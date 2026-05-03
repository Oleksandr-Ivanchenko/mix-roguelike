import Phaser from "phaser";

export class EffectsSystem {
  constructor(scene) {
    this.scene = scene;
  }

  hit(x, y, color = 0xffffff) {
    const s = this.scene;
    for (let i = 0; i < 6; i++) {
      const c = s.add.circle(x, y, Phaser.Math.Between(2, 5), color).setDepth(10);
      const a = Math.random() * Math.PI * 2;
      const r = Phaser.Math.Between(15, 50);
      s.tweens.add({
        targets: c,
        x: x + Math.cos(a) * r, y: y + Math.sin(a) * r,
        alpha: 0, scaleX: 0.1, scaleY: 0.1,
        duration: 280,
        onComplete: () => c.destroy()
      });
    }
  }

  crit(x, y, damage) {
    const s = this.scene;
    for (let i = 0; i < 10; i++) {
      const c = s.add.circle(x, y, Phaser.Math.Between(3, 8), 0xff4400).setDepth(11);
      const a = Math.random() * Math.PI * 2;
      const r = Phaser.Math.Between(20, 65);
      s.tweens.add({
        targets: c,
        x: x + Math.cos(a) * r, y: y + Math.sin(a) * r,
        alpha: 0, scaleX: 0.1, scaleY: 0.1,
        duration: 350,
        onComplete: () => c.destroy()
      });
    }
    const txt = s.add.text(x, y - 8, `CRIT! ${damage}`, {
      fontSize: "15px", color: "#ff4400",
      fontFamily: "monospace", fontStyle: "bold",
      stroke: "#000000", strokeThickness: 3
    }).setOrigin(0.5).setDepth(15);
    s.tweens.add({
      targets: txt,
      y: y - 52, alpha: 0, scaleX: 1.3, scaleY: 1.3,
      duration: 700, ease: "Power2",
      onComplete: () => txt.destroy()
    });
  }

  death(x, y) {
    const s = this.scene;
    for (let i = 0; i < 12; i++) {
      const c = s.add.circle(x, y, Phaser.Math.Between(3, 8), 0xff2200).setDepth(10);
      const a = (i / 12) * Math.PI * 2;
      const r = Phaser.Math.Between(25, 70);
      s.tweens.add({
        targets: c,
        x: x + Math.cos(a) * r, y: y + Math.sin(a) * r,
        alpha: 0, duration: 500, ease: "Power2",
        onComplete: () => c.destroy()
      });
    }
  }

  explosion(x, y) {
    const s = this.scene;
    const ring = s.add.circle(x, y, 4, 0xff6600, 0.9).setDepth(12);
    s.tweens.add({ targets: ring, scaleX: 18, scaleY: 18, alpha: 0, duration: 320, ease: "Cubic.easeOut", onComplete: () => ring.destroy() });
    for (let i = 0; i < 10; i++) {
      const c = s.add.circle(x, y, Phaser.Math.Between(3, 7), i % 2 === 0 ? 0xff4400 : 0xffaa00).setDepth(13);
      const a = Math.random() * Math.PI * 2;
      const r = Phaser.Math.Between(20, 75);
      s.tweens.add({ targets: c, x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, alpha: 0, duration: 380, onComplete: () => c.destroy() });
    }
  }

  chainArc(x1, y1, x2, y2) {
    const s = this.scene;
    const g = s.add.graphics().setDepth(14);
    g.lineStyle(2, 0x88ffff, 0.9);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath();
    s.tweens.add({ targets: g, alpha: 0, duration: 220, onComplete: () => g.destroy() });
    this.hit(x2, y2, 0x88ffff);
  }

  freeze(x, y) {
    const s = this.scene;
    for (let i = 0; i < 8; i++) {
      const c = s.add.circle(x, y, Phaser.Math.Between(2, 5), 0x88ddff).setDepth(11);
      const a = (i / 8) * Math.PI * 2;
      s.tweens.add({ targets: c, x: x + Math.cos(a) * 30, y: y + Math.sin(a) * 30, alpha: 0, duration: 300, onComplete: () => c.destroy() });
    }
  }

  burn(x, y) {
    const s = this.scene;
    for (let i = 0; i < 5; i++) {
      const c = s.add.circle(x, y, Phaser.Math.Between(2, 4), 0xff5500).setDepth(11);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      s.tweens.add({ targets: c, x: x + Math.cos(a) * 18, y: y + Math.sin(a) * 22, alpha: 0, duration: 350, onComplete: () => c.destroy() });
    }
  }

  whirlwind(x, y, radius) {
    const s = this.scene;
    const ring = s.add.circle(x, y, radius, 0x9955ff, 0).setDepth(9)
      .setStrokeStyle(3, 0xcc88ff);
    s.tweens.add({ targets: ring, alpha: 0.4, duration: 120, yoyo: true, onComplete: () => ring.destroy() });
  }

  meteor(x, y) {
    const s = this.scene;
    const W = s.cameras.main.scrollX;
    const H = s.cameras.main.scrollY;
    const ball = s.add.circle(x, y - 200, 10, 0xff4400, 0.9).setDepth(14);
    s.tweens.add({
      targets: ball, x, y, duration: 400, ease: "Cubic.easeIn",
      onComplete: () => {
        ball.destroy();
        this.explosion(x, y);
        const shockwave = s.add.circle(x, y, 5, 0xff2200, 0).setDepth(9).setStrokeStyle(3, 0xff6600);
        s.tweens.add({ targets: shockwave, scaleX: 16, scaleY: 16, alpha: 0, duration: 400, onComplete: () => shockwave.destroy() });
      }
    });
  }

  shield(x, y) {
    const s = this.scene;
    const ring = s.add.circle(x, y, 24, 0xffffff, 0).setDepth(9).setStrokeStyle(3, 0xffeebb, 0.8);
    s.tweens.add({ targets: ring, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 400, onComplete: () => ring.destroy() });
  }
}

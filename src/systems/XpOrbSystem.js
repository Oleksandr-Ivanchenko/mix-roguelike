import Phaser from "phaser";

export class XpOrbSystem {
  constructor(scene) {
    this.scene = scene;
     scene.physics.add.overlap(scene.player, scene.xpOrbs, (player, orb) => {
    if (!orb.active) return;
    orb.destroy();
    scene.progression.gainXP(orb.xpVal);
  });
  }

  spawn(x, y, val) {
    const s     = this.scene;
    const big   = val >= 25;
    const color = big ? 0xffdd00 : 0x44ff88;
    const size  = big ? 10 : 7;
    const orb   = s.add.circle(x, y, size, color).setDepth(3);
    s.physics.add.existing(orb);
    orb.body.setCircle(size);
    orb.xpVal = val;
    s.xpOrbs.add(orb);
    orb.setAlpha(0);
    s.tweens.add({ targets: orb, alpha: 1, duration: 200 });
    s.time.addEvent({
      delay: 300,
      callback: () => {
        if (!orb.active) return;
        s.physics.moveToObject(orb, s.player, 120);
      }
    });
  }

  update() {
    const s = this.scene;
    s.xpOrbs.getChildren().forEach(orb => {
      if (!orb.active) return;
      const d = Phaser.Math.Distance.Between(orb.x, orb.y, s.player.x, s.player.y);
      if (d < 80) {
        s.physics.moveToObject(orb, s.player, 150 + (80 - d) * 2);
      }
    });
  }
}

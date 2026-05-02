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
    orb.body.setImmovable(true);
    orb.body.setAllowGravity(false);
    orb.xpVal = val;
    s.xpOrbs.add(orb);
    orb.setAlpha(0);
    s.tweens.add({ targets: orb, alpha: 1, duration: 200 });
    // Лёгкое покачивание на месте
    s.tweens.add({ targets: orb, y: y - 3, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    // Исчезает через 15 секунд
    s.time.delayedCall(15000, () => {
      if (orb.active) s.tweens.add({ targets: orb, alpha: 0, duration: 400, onComplete: () => orb.destroy() });
    });
  }

  update() {} // орбы статичны, двигать не нужно
}

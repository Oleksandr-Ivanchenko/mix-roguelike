export class MobileControls {
  constructor(scene) {
    this.scene     = scene;
    this.dx        = 0;
    this.dy        = 0;
    this._active   = false;
    this._ptrid    = null;
    this._jcx      = 0;
    this._jcy      = 0;
    this._radius   = 55;
    this._thumb    = null;
    this._els      = [];
  }

  static isTouchDevice() {
    return navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
  }

  build() {
    if (!MobileControls.isTouchDevice()) return;
    // Allow up to 4 simultaneous pointers (joystick + buttons)
    this.scene.input.addPointer(3);
    this._buildJoystick();
    this._buildButtons();
    this._bindInput();
  }

  _buildJoystick() {
    const s   = this.scene;
    const H   = s.cameras.main.height;
    const cx  = 80;
    const cy  = H - 80;
    const r   = this._radius;
    this._jcx = cx;
    this._jcy = cy;

    const base = s.add.graphics().setScrollFactor(0).setDepth(80);
    base.fillStyle(0xffffff, 0.06);
    base.fillCircle(cx, cy, r);
    base.lineStyle(2, 0xffffff, 0.18);
    base.strokeCircle(cx, cy, r);

    this._thumb = s.add.graphics().setScrollFactor(0).setDepth(81);
    this._drawThumb(cx, cy);

    this._els.push(base, this._thumb);
  }

  _drawThumb(x, y) {
    this._thumb.clear();
    this._thumb.fillStyle(0xffffff, 0.38);
    this._thumb.fillCircle(x, y, 22);
  }

  _buildButtons() {
    const s = this.scene;
    const W = s.cameras.main.width;
    const H = s.cameras.main.height;

    const defs = [
      { label: "⚡", x: W - 55,  y: H - 145, key: "dodge", color: 0x1a2255 },
      { label: "E",  x: W - 120, y: H - 80,  key: "shop",  color: 0x1a3322 },
      { label: "Q",  x: W - 55,  y: H - 80,  key: "q",     color: 0x331a44 },
      { label: "F",  x: W - 185, y: H - 80,  key: "f",     color: 0x333311 },
    ];

    this._buttons = defs.map(def => {
      const g = s.add.graphics().setScrollFactor(0).setDepth(80);
      g.fillStyle(def.color, 0.88);
      g.fillCircle(def.x, def.y, 28);
      g.lineStyle(1.5, 0xffffff, 0.25);
      g.strokeCircle(def.x, def.y, 28);

      const txt = s.add.text(def.x, def.y, def.label, {
        fontSize: "18px", color: "#ccddff", fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(81);

      this._els.push(g, txt);
      return { x: def.x, y: def.y, r: 32, key: def.key };
    });
  }

  _bindInput() {
    const s   = this.scene;
    const jcx = this._jcx;
    const jcy = this._jcy;
    const jr  = this._radius * 2.2; // capture zone a bit larger than visual

    const inJoy = (px, py) => Math.hypot(px - jcx, py - jcy) < jr;

    s.input.on("pointerdown", (ptr) => {
      const px = ptr.x, py = ptr.y;
      if (inJoy(px, py) && !this._active) {
        this._active = true;
        this._ptrid  = ptr.id;
        this._moveJoy(px, py);
        return;
      }
      this._buttons?.forEach(btn => {
        if (Math.hypot(px - btn.x, py - btn.y) < btn.r) {
          this._fireButton(btn.key);
        }
      });
    });

    s.input.on("pointermove", (ptr) => {
      if (this._active && ptr.id === this._ptrid) {
        this._moveJoy(ptr.x, ptr.y);
      }
    });

    s.input.on("pointerup", (ptr) => {
      if (ptr.id === this._ptrid) {
        this._active = false;
        this._ptrid  = null;
        this.dx      = 0;
        this.dy      = 0;
        this._drawThumb(jcx, jcy);
      }
    });
  }

  _moveJoy(px, py) {
    const dx   = px - this._jcx;
    const dy   = py - this._jcy;
    const dist = Math.hypot(dx, dy);
    const r    = this._radius;
    const clamped = Math.min(dist, r);
    const angle   = Math.atan2(dy, dx);
    this._drawThumb(
      this._jcx + Math.cos(angle) * clamped,
      this._jcy + Math.sin(angle) * clamped
    );
    this.dx = (dist > 6) ? Math.cos(angle) * (clamped / r) : 0;
    this.dy = (dist > 6) ? Math.sin(angle) * (clamped / r) : 0;
  }

  _fireButton(key) {
    const s = this.scene;
    switch (key) {
      case "dodge": s._doDodge?.();       break;
      case "shop":  s.oreShopMenu?.toggle?.(); break;
      case "q":     s._useSkill?.(0);    break;
      case "f":     s._useSkill?.(1);    break;
    }
  }
}

// Tile index constants — adjust to match the actual tileset layout
export const TILES = {
  // Floor variants (row 0-1 of tileset)
  FLOOR: [0, 1, 2, 3, 16, 17, 18],
  // Wall faces
  WALL_MID:        64,   // solid wall block (row 4 col 0)
  WALL_TOP:        48,   // wall top-cap (row 3 col 0)
  WALL_LEFT:       49,
  WALL_RIGHT:      50,
  WALL_CORNER_TL:  51,
  WALL_CORNER_TR:  52,
};

export class MapBuilder {
  // ── Public API ─────────────────────────────────────────────────────────────
  static build(w, h) {
    const map = Array.from({ length: h }, () => Array(w).fill(0));

    // 1. Central arena — always open, player spawns here
    const centerRoom = {
      x: Math.floor(w / 2) - 7,
      y: Math.floor(h / 2) - 5,
      w: 14, h: 10,
    };
    this._carveRoom(map, centerRoom);
    const rooms = [centerRoom];

    // 2. Additional random rooms
    const TARGET_ROOMS = 6;
    for (let tries = 0; tries < 200 && rooms.length < TARGET_ROOMS; tries++) {
      const rw = 6  + Math.floor(Math.random() * 10);
      const rh = 5  + Math.floor(Math.random() * 7);
      const rx = 1  + Math.floor(Math.random() * (w - rw - 2));
      const ry = 1  + Math.floor(Math.random() * (h - rh - 2));
      const room = { x: rx, y: ry, w: rw, h: rh };
      if (!this._overlaps(rooms, room, 2)) {
        rooms.push(room);
        this._carveRoom(map, room);
      }
    }

    // 3. Connect rooms with 2-wide L-corridors so nothing is isolated
    for (let i = 1; i < rooms.length; i++) {
      this._carveCorridor(map, rooms[i - 1], rooms[i]);
    }

    // 4. Scatter 2×2 pillars inside large rooms
    for (const room of rooms) {
      if (room.w >= 10 && room.h >= 8) {
        this._placePillars(map, room, 2);
      }
    }

    // 5. Thin random walls (single-cell obstacles) in open areas for cover
    this._scatterObstacles(map, w, h, 12);

    // 6. Ensure a 1-cell border stays solid
    for (let x = 0; x < w; x++) { map[0][x] = 0; map[h - 1][x] = 0; }
    for (let y = 0; y < h; y++) { map[y][0] = 0; map[y][w - 1] = 0; }

    return map;
  }

  static findFreeCell(map, mapW, mapH) {
    const cx = Math.floor(mapW / 2);
    const cy = Math.floor(mapH / 2);
    for (let r = 0; r < 5; r++)
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++)
          if (map[cy + dy]?.[cx + dx] === 1) return { x: cx + dx, y: cy + dy };
    return { x: 2, y: 2 };
  }

  // ── Map query helpers ──────────────────────────────────────────────────────
  // Returns true if any of the 4 cardinal neighbors is a wall
  static isBorderFloor(map, x, y) {
    return (
      map[y - 1]?.[x] === 0 || map[y + 1]?.[x] === 0 ||
      map[y]?.[x - 1] === 0 || map[y]?.[x + 1] === 0
    );
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  static _carveRoom(map, room) {
    for (let y = room.y; y < room.y + room.h; y++)
      for (let x = room.x; x < room.x + room.w; x++)
        if (y > 0 && y < map.length - 1 && x > 0 && x < map[0].length - 1)
          map[y][x] = 1;
  }

  static _overlaps(rooms, candidate, margin = 1) {
    return rooms.some(r =>
      candidate.x < r.x + r.w + margin &&
      candidate.x + candidate.w + margin > r.x &&
      candidate.y < r.y + r.h + margin &&
      candidate.y + candidate.h + margin > r.y
    );
  }

  static _carveCorridor(map, a, b) {
    const ax = Math.floor(a.x + a.w / 2);
    const ay = Math.floor(a.y + a.h / 2);
    const bx = Math.floor(b.x + b.w / 2);
    const by = Math.floor(b.y + b.h / 2);
    const h  = map.length, w = map[0].length;

    // Horizontal leg
    for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
      if (ay > 0 && ay < h - 1) map[ay][x] = 1;
      if (ay + 1 > 0 && ay + 1 < h - 1) map[ay + 1][x] = 1;
    }
    // Vertical leg
    for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
      if (bx > 0 && bx < w - 1) map[y][bx] = 1;
      if (bx + 1 > 0 && bx + 1 < w - 1) map[y][bx + 1] = 1;
    }
  }

  static _placePillars(map, room, count) {
    const candidates = [];
    for (let y = room.y + 2; y < room.y + room.h - 3; y += 3)
      for (let x = room.x + 2; x < room.x + room.w - 3; x += 3)
        candidates.push({ x, y });
    // Shuffle and pick
    candidates.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, candidates.length); i++) {
      const { x, y } = candidates[i];
      map[y][x] = 0; map[y][x + 1] = 0;
      map[y + 1][x] = 0; map[y + 1][x + 1] = 0;
    }
  }

  static _scatterObstacles(map, w, h, count) {
    let placed = 0;
    for (let tries = 0; tries < count * 10 && placed < count; tries++) {
      const x = 2 + Math.floor(Math.random() * (w - 4));
      const y = 2 + Math.floor(Math.random() * (h - 4));
      // Only place in open floor, away from center
      if (map[y][x] !== 1) continue;
      const cx = w / 2, cy = h / 2;
      if (Math.hypot(x - cx, y - cy) < 8) continue; // keep center clear
      map[y][x] = 0;
      placed++;
    }
  }
}

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
  // Новый room-based сценарный уровень
  static buildLevel(w, h) {
    const map = Array.from({ length: h }, () => Array(w).fill(0));
    const rooms = [
      { type: "start",  x: 5,  y: 10, w: 8, h: 8 },
      { type: "spawn1", x: 18, y: 4,  w: 10, h: 8 },
      { type: "spawn2", x: 18, y: 16, w: 10, h: 8 },
      { type: "boss",   x: 35, y: 10, w: 12, h: 10 }
    ];
    rooms.forEach(r => this._carveRoom(map, r));
    this._connectRooms(map, rooms[0], rooms[1]);
    this._connectRooms(map, rooms[1], rooms[2]);
    this._connectRooms(map, rooms[2], rooms[3]);
    const roomData = rooms.map(r => ({
      ...r,
      center: {
        x: Math.floor(r.x + r.w / 2),
        y: Math.floor(r.y + r.h / 2)
      },
      triggered: false
    }));
    return { map, rooms: roomData };
  }

  // Старый build для совместимости (можно удалить позже)
  static build(w, h) {
    const map = Array.from({ length: h }, () => Array(w).fill(0));
    // ...existing code...
    // (оставь пустым или скопируй старую random dungeon генерацию, если нужно)
    return map;
  }

  static findFreeCell(map, mapW, mapH) {
    // Поиск свободной клетки в стартовой комнате (центр)
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

  static _connectRooms(map, a, b) {
    // Соединяет центры комнат коридором
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

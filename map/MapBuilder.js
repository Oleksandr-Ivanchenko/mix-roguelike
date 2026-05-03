export class MapBuilder {
  static build(w, h) {
    // Все стены по умолчанию
    const map = Array.from({ length: h }, () => Array(w).fill(0));

    // Открытый интерьер
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++)
        map[y][x] = 1;

    // Симметричные колонны (2×2) по углам арены — далеко от стен
    const pillars = [
      { x: 5,  y: 4  }, { x: 5,  y: h - 6 },
      { x: w - 7, y: 4  }, { x: w - 7, y: h - 6 },
    ];
    for (const { x, y } of pillars) {
      if (x > 2 && x + 1 < w - 2 && y > 2 && y + 1 < h - 2) {
        map[y][x]     = 0; map[y][x + 1]     = 0;
        map[y + 1][x] = 0; map[y + 1][x + 1] = 0;
      }
    }

    return map;
  }

  static findFreeCell(map, mapW, mapH) {
    // Центр арены — гарантированно свободен
    const cx = Math.floor(mapW / 2);
    const cy = Math.floor(mapH / 2);
    if (map[cy][cx] === 1) return { x: cx, y: cy };
    // Fallback
    for (let y = 2; y < mapH - 2; y++)
      for (let x = 2; x < mapW - 2; x++)
        if (map[y][x] === 1) return { x, y };
    return { x: 2, y: 2 };
  }
}

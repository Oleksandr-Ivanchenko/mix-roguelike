export const ITEMS = {
  coin_small:    { key: "coin_small",    type: "currency", label: "Монета",          weight: 80, value: 1  },
  coin_large:    { key: "coin_large",    type: "currency", label: "Золотая монета",   weight: 25, value: 3  },
  IronOre:       { key: "IronOre",       type: "material", label: "Железо",     rarity: "common",    weight: 40 },
  CopperOre:     { key: "CopperOre",     type: "material", label: "Медь",       rarity: "common",    weight: 30 },
  GoldOre:       { key: "GoldOre",       type: "material", label: "Золото",     rarity: "rare",      weight: 15 },
  PlatinumOre:   { key: "PlatinumOre",   type: "material", label: "Платина",    rarity: "epic",      weight: 8  },
  MythrilOre:    { key: "MythrilOre",    type: "material", label: "Мифрил",     rarity: "epic",      weight: 4  },
  ObsidianChunk: { key: "ObsidianChunk", type: "material", label: "Обсидиан",   rarity: "legendary", weight: 1  },
};

export const ITEM_LIST = Object.values(ITEMS);

export const ORE_KEYS = ["IronOre","CopperOre","GoldOre","PlatinumOre","MythrilOre","ObsidianChunk"];

export const ORE_SHORT = {
  IronOre: "Fe", CopperOre: "Cu", GoldOre: "Au",
  PlatinumOre: "Pt", MythrilOre: "My", ObsidianChunk: "Ob",
};

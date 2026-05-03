import { defineConfig } from "vite";

export default defineConfig({
  base: "/mix-roguelike/",
  publicDir: "src",   // src/assets/** served as assets/**
  build: {
    outDir: "dist",
  },
});

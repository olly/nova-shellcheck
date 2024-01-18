import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/main.ts",
  plugins: [typescript()],
  output: {
    file: "shellcheck.novaextension/Scripts/main.dist.js",
    sourcemap: true,
    format: "cjs",
  },
};

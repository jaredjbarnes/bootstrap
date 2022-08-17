import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import pkg from "./package.json";

export default [
  {
    input: "src/index.ts",
    output: { file: pkg.main, format: "cjs" },
    plugins: [peerDepsExternal(), resolve(), typescript(), commonjs()],
  },
  {
    input: "src/index.ts",
    output: { file: pkg.module, format: "es" },
    plugins: [peerDepsExternal(), resolve(), typescript(), commonjs()],
  },
];

import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

export default [
  {
    input: "src/index.ts",
    output: { file: pkg.main, format: "cjs" },
    plugins: [typescript(), resolve(), commonjs()],
    external,
  },
  {
    input: "src/index.ts",
    output: { file: pkg.module, format: "es" },
    plugins: [typescript(), resolve(), commonjs()],
    external,
  },
];

import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.[t|j]sx?$": "ts-jest",
  },
};
export default config;

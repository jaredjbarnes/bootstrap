import { App } from "./app";

export interface EnvironmentState<TConfig> {
  readonly config: TConfig;
  mount(app: App, window: Window): Promise<void>;
  unmount(): Promise<void>;
}

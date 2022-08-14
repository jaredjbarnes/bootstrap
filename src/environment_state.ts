import { App } from "./app";
import { ReadonlyAsyncActionRunner } from "./hex/async_action_runner";

export interface EnvironmentState<TConfig> {
  readonly config: TConfig;
  mount(app: App, window: Window): Promise<void>;
  unmount(): Promise<void>;
}

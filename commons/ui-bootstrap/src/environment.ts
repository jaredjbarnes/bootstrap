import { App } from "./app";
import { IsolatedEnvironment } from "./isolated_environment";
import { DefaultEnvironment } from "./default_environment";
import { EnvironmentState } from "./environment_state";
import { AsyncActionRunner, ReadonlyAsyncActionRunner } from "ui-hex";

export class Environment<TConfig> {
  private _slot: HTMLElement;
  private _moduleBroadcast = new AsyncActionRunner<void>(undefined);
  private _isolatedEnvironment: IsolatedEnvironment<TConfig>;
  private _defaultEnvironment: DefaultEnvironment<TConfig>;
  private _currentEnvironment: EnvironmentState<TConfig>;

  app: App | null = null;

  get moduleBroadcast(): ReadonlyAsyncActionRunner<void> {
    return this._moduleBroadcast;
  }

  constructor(slot: HTMLElement, config: TConfig) {
    this._slot = slot;
    this._defaultEnvironment = new DefaultEnvironment(slot, config);
    this._isolatedEnvironment = new IsolatedEnvironment(slot, config);
    this._currentEnvironment = this._defaultEnvironment;
  }

  mount(app: App, window: Window) {
    this.app = app;

    if (app.runInIsolation) {
      this._currentEnvironment = this._isolatedEnvironment;
    } else {
      this._currentEnvironment = this._defaultEnvironment;
    }

    return this._moduleBroadcast.execute(() =>
      this._currentEnvironment.mount(app, window)
    );
  }

  async unmount() {
    try {
      await this._currentEnvironment.unmount();
    } catch (e) {}

    while (this._slot.firstChild) {
      this._slot.removeChild(this._slot.firstChild);
    }

    this.app = null;
  }

  cancel() {
    return this._moduleBroadcast.cancel();
  }
}

import { App, AppModule } from "./app";
import { EnvironmentState } from "./environment_state";
import { AsyncAction } from "./hex/async_action";
import {
  AsyncActionRunner,
  ReadonlyAsyncActionRunner,
} from "./hex/async_action_runner";

const html = `<!DOCTYPE html>
<html>
    <head>
        <style>
          html, body {
            padding: 0;
            margin: 0;
            width:100%;
            height:100%;  
          }
        </style>
    </head>
    <body></body>
</html>
`;

export class DefaultEnvironment<TConfig> implements EnvironmentState<TConfig> {
  private _slot: HTMLElement;
  private _appModule: AppModule<TConfig> | null = null;
  config: TConfig;

  constructor(slot: HTMLElement, config: TConfig) {
    this._slot = slot;
    this.config = config;
  }

  mount(app: App): Promise<void> {
    return import(app.scriptUrl).then((appModule: AppModule<TConfig>) => {
      this._appModule = appModule;
      appModule.onMount(this._slot, this.config);
    });
  }

  async unmount() {
    const appModule = this._appModule;

    if (appModule != null) {
      await appModule.onUnmount();
      this._appModule = null;
    }
  }
}

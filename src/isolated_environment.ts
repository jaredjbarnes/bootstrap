import { App, AppModule } from "./app";
import { EnvironmentState } from "./environment_state";
import { AsyncAction } from "./hex/async_action";
import {
  AsyncActionRunner,
  ReadonlyAsyncActionRunner,
} from "./hex/async_action_runner";

const html = `<!DOCTYPE html>
<html>
    <head></head>
    <body></body>
</html>
`;

export class IsolatedEnvironment<TConfig> implements EnvironmentState<TConfig> {
  private _mountingBroadcastRunner = new AsyncActionRunner<void>(undefined);
  private _iframe: HTMLIFrameElement | null = null;
  private _slot: HTMLElement;
  private _appModule: AppModule<TConfig> | null = null;

  config: TConfig;

  get mountingBroadcast(): ReadonlyAsyncActionRunner<void> {
    return this._mountingBroadcastRunner;
  }

  constructor(slot: HTMLElement, config: TConfig) {
    this._slot = slot;
    this.config = config;
  }

  mount(app: App, window: Window): Promise<void> {
    const action = new AsyncAction(() => {
      return new Promise<void>((resolve, reject) => {
        this._iframe = window.document.createElement("iframe");
        this._iframe.style.padding = "0";
        this._iframe.style.margin = "0";
        this._iframe.style.border = "0";
        this._iframe.style.width = "100%";
        this._iframe.style.height = "100%";

        this._iframe.onload = () => {
          const contentWindow = this._iframe?.contentWindow;

          if (contentWindow != null) {
            const body = contentWindow.document.body;
            const html = contentWindow.document.querySelector("html");

            if (body != null && html != null) {
              this.prepareElementToBeAContainer(html);
              this.prepareElementToBeAContainer(body);
            }

            const importScript = new (contentWindow as any).Function(
              "url",
              "return import(url);"
            );

            importScript(app.scriptUrl)
              .then((appModule: AppModule<TConfig>) => {
                this._appModule = appModule;
                return appModule.onMount(body, this.config);
              })
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error("Couldn't find the body element."));
          }
        };

        this._slot.appendChild(this._iframe);
        this._iframe.srcdoc = html;
      });
    });

    return this._mountingBroadcastRunner.execute(action);
  }

  async unmount() {
    const appModule = this._appModule;
    this._iframe = null;

    if (appModule != null) {
      await appModule.onUnmount();
      this._appModule = null;
    }
  }

  private prepareElementToBeAContainer(element: HTMLElement) {
    element.style.padding = "0";
    element.style.margin = "0";
    element.style.width = "100%";
    element.style.height = "100%";
  }
}

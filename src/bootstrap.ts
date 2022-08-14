import { App } from "./app";
import { Environment } from "./environment";

export class Bootstrap<TConfig> {
  private _config: TConfig;
  private _window: Window;
  private _hashSlot: HTMLElement;
  private slots = new WeakMap();
  private _appsByPath: Map<string, App> = new Map();
  private _appsByName: Map<string, App> = new Map();
  private _defaultPath = "";

  constructor(config: TConfig, hashSlot: HTMLElement, window: Window) {
    this._config = config;
    this._hashSlot = hashSlot;
    this._window = window;

    this._window.addEventListener("hashchange", this.loadHash);
  }

  registerApp(app: App) {
    if (!this._appsByPath.has(app.path)) {
      this._appsByPath.set(app.path, app);
      this._appsByName.set(app.name, app);
    }
  }

  unregisterApp(appConfig: App) {
    if (this._appsByPath.has(appConfig.path)) {
      this._appsByPath.delete(appConfig.path);
    }
  }

  initialize(defaultPath: string) {
    this._defaultPath = defaultPath;
    const { path, parameters } = this.parseRootHash(this._window.location.hash);
    const slot = this.getSlot(parameters.get("slot"));

    if (path == null) {
      this.loadByPath(defaultPath, slot);
    } else {
      this.loadByPath(path, slot);
    }
  }

  loadByPath(path: string, slot: HTMLElement) {
    const { path: rootPath } = this.parseRootPath(path);
    const app = this._appsByPath.get(rootPath);

    if (app != null) {
      this.syncPath(app.path);
      this.load(app.name, slot, this._window);
    }
  }

  async load(name: string, slotElement: HTMLElement, window: Window) {
    const app = this._appsByName.get(name);
    let environment = this.slots.get(slotElement) as Environment<TConfig>;

    if (app == null) {
      throw new Error(`Unregistered app with name: ${name}.`);
    }

    if (environment == null) {
      environment = new Environment(slotElement, this._config);
      this.slots.set(slotElement, environment);
    }

    if (environment.app === app) {
      return;
    }

    try {
      environment.cancel();
      await environment.unmount();
      await environment.mount(app, window);
    } catch (e) {}
  }

  getEnvironment(slot: HTMLElement) {
    return this.slots.get(slot);
  }

  private loadHash = () => {
    const { path, parameters } = this.parseRootHash(this._window.location.hash);
    const slot = this.getSlot(parameters.get("slot"));
    this.loadByPath(path, slot);
  };

  private getSlot(selector: string | null) {
    if (selector == null) {
      return this._hashSlot;
    } else {
      return (
        (this._window.document.querySelector(selector) as HTMLElement) ||
        this._hashSlot
      );
    }
  }

  private parseRootHash(hash: string) {
    return this.parseRootPath(hash.slice(1));
  }

  private parseRootPath(path: string) {
    const parts = path.split("?");
    const rootPath = parts[0].split("/")[1];
    const search = parts[1];
    const searchParams = new URLSearchParams(search);

    return {
      fullPath: path,
      path: rootPath == null ? this._defaultPath : `/${rootPath}`,
      parameters: searchParams,
    };
  }

  private syncPath(path: string) {
    const hash = this._window.location.hash;
    const { path: currentRootPath } = this.parseRootHash(hash);
    const { path: newPath } = this.parseRootPath(path);

    if (newPath !== currentRootPath || hash.length === 0) {
      this._window.location = `#${path}`;
    }
  }

  dispose() {
    this._window.removeEventListener("hashchange", this.loadHash);
  }
}

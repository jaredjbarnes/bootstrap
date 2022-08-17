import { App } from "./app";
export declare class Bootstrap<TConfig> {
    private _config;
    private _window;
    private _hashSlot;
    private slots;
    private _appsByPath;
    private _appsByName;
    private _defaultPath;
    constructor(config: TConfig, hashSlot: HTMLElement, window: Window);
    registerApp(app: App): void;
    unregisterApp(appConfig: App): void;
    initialize(defaultPath: string): void;
    loadByPath(path: string, slot: HTMLElement): void;
    load(name: string, slotElement: HTMLElement, window: Window): Promise<void>;
    getEnvironment(slot: HTMLElement): any;
    private loadHash;
    private getSlot;
    private parseRootHash;
    private parseRootPath;
    private syncPath;
    dispose(): void;
}

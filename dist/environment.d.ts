import { App } from "./app";
import { ReadonlyAsyncActionRunner } from "./hex/async_action_runner";
export declare class Environment<TConfig> {
    private _slot;
    private _moduleBroadcast;
    private _isolatedEnvironment;
    private _defaultEnvironment;
    private _currentEnvironment;
    app: App | null;
    get moduleBroadcast(): ReadonlyAsyncActionRunner<void>;
    constructor(slot: HTMLElement, config: TConfig);
    mount(app: App, window: Window): Promise<void>;
    unmount(): Promise<void>;
    cancel(): void;
}

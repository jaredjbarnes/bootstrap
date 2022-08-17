import { App } from "./app";
import { EnvironmentState } from "./environment_state";
import { ReadonlyAsyncActionRunner } from "./hex/async_action_runner";
export declare class IsolatedEnvironment<TConfig> implements EnvironmentState<TConfig> {
    private _mountingBroadcastRunner;
    private _iframe;
    private _slot;
    private _appModule;
    config: TConfig;
    get mountingBroadcast(): ReadonlyAsyncActionRunner<void>;
    constructor(slot: HTMLElement, config: TConfig);
    mount(app: App, window: Window): Promise<void>;
    unmount(): Promise<void>;
    private createIframe;
    private prepareElementToBeAContainer;
}

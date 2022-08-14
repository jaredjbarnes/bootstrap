import { App } from "./app";
import { EnvironmentState } from "./environment_state";
export declare class DefaultEnvironment<TConfig> implements EnvironmentState<TConfig> {
    private _slot;
    private _appModule;
    config: TConfig;
    constructor(slot: HTMLElement, config: TConfig);
    mount(app: App): Promise<void>;
    unmount(): Promise<void>;
}
